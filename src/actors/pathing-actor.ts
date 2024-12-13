import { Astar, Grid } from "fast-astar";
import {
	type Vector2,
	engineObjects,
	isOverlapping,
	vec2,
} from "littlejsengine";
import { ObstacleEngineObject } from "../engine-objects/obstacle-engine-object";
import type { Message } from "../messages/message";
import { posInRect, yeet } from "../utilities/utilities";
import { Actor } from "./actor";
import type { WorldActor } from "./world-actor";

export type AstarCoords = [x: number, y: number];

export class PathingActor extends Actor {
	constructor(
		private readonly _worldActor: WorldActor,
		...params: ConstructorParameters<typeof Actor>
	) {
		super(...params);
		this.actorDirectory.registerActorAlias("pathingActor", this.actorId);

		// number of astar nodes inside one world unit, times world units in sector, for all 9 sectors
		this._astarNodeSize = 1;
		this._gridSize = vec2(
			(1 / this._astarNodeSize) * (this._worldActor._sectorSize * 3),
		);
		this._pathCache = new Map<number, Vector2[]>();
		this._grid = new Grid({ col: 10, row: 10 }); // will be replaced
		this._astar = new Astar(this._grid); // will be replaced
	}

	private readonly _astarNodeSize: number;
	private readonly _gridSize: Vector2;
	private _pathCache: Map<number, Vector2[]>;
	private _grid: Grid;
	private _astar: Astar;

	protected handleMessage<T extends Message>(message: T): void {}

	getPath(origin: Vector2, destination: Vector2): Vector2[] | undefined {
		const originASPos = this.worldPosToAstarPos(origin);
		const destinationASPos = this.worldPosToAstarPos(destination);

		// check cache
		const cacheKey = this.getCacheKey(
			originASPos.x,
			originASPos.y,
			destinationASPos.x,
			destinationASPos.y,
		);
		const cachedPath = this._pathCache.get(cacheKey);
		if (cachedPath) {
			return cachedPath;
		}

		// find path
		this.definePathingGrid(); // guess you gotta do it each time
		try {
			const astarPath = this._astar.search(
				[originASPos.x, originASPos.y],
				[destinationASPos.x, destinationASPos.y],
			);

			if (!astarPath) {
				return undefined;
			}

			const worldPath = astarPath.map((aspNode) =>
				this.astarPosToWorldPos(vec2(aspNode[0], aspNode[1])),
			);

			this._pathCache.set(cacheKey, worldPath);

			return worldPath;
		} catch (e) {
			console.error('astar be like "nope"');
			return undefined;
		}
	}

	/** converts a world position (in world units) into an Astar grid position (rounded) */
	private worldPosToAstarPos(worldPos: Vector2) {
		// note: the astar grid moves with the camera and covers the 9 adjacent sectors
		// note: the astar grid is not centered on the camera at (0, 0), but at (width/2, height/2)

		// position (in world units) of center of current sector
		const sectorCenterWU = this._worldActor.sectorPos(
			this._worldActor.sector(),
		);

		// offset (in world units) of worldPos param, relative to current sector center
		const offsetFromSectorCenterWU = worldPos.subtract(sectorCenterWU);

		// scale world units to astar units
		const offsetFromSectorCenterAU = offsetFromSectorCenterWU.scale(
			1 / this._astarNodeSize,
		);

		// translate over to astar origin (bottom left)
		const astarPos = offsetFromSectorCenterAU.add(
			vec2(this._gridSize).scale(0.5),
		);

		// round values to snap to astar grid
		return vec2(Math.round(astarPos.x), Math.round(astarPos.y));
	}

	/** converts an astar osition (in astar units) into a world position (in world units) */
	private astarPosToWorldPos(astarPos: Vector2) {
		// translate astar pos to be relative to center of sector (at (0, 0))
		const offsetFromSectorCenterAU = astarPos.subtract(
			vec2(this._gridSize).scale(0.5),
		);

		// scale from astar units into world units
		const offsetFromSectorCenterWU = offsetFromSectorCenterAU.scale(
			this._astarNodeSize,
		);

		// translate from relative to sector center to relative to world center
		const sectorCenterWU = this._worldActor.sectorPos(
			this._worldActor.sector(),
		);
		return offsetFromSectorCenterWU.add(sectorCenterWU);
	}

	private getCacheKey(x1: number, y1: number, x2: number, y2: number): number {
		// return (((ox << 16) ^ oy) << 32) ^ ((dx << 16) ^ dy); // had collisions happening?
		// return (BigInt(x1) << 48n) | (BigInt(y1) << 32n) | (BigInt(x2) << 16n) | BigInt(y2); // requires latest js version
		// return `${x1},${y1},${x2},${y2}`; // works, maybe not super efficient
		return x1 * 1000000 + y1 * 10000 + x2 * 100 + y2; // good as long as grid doesn't exceed 100x100
	}

	private definePathingGrid(): void {
		// define grid
		this._grid = new Grid({
			col: this._gridSize.x,
			row: this._gridSize.y,
		});

		// add obstacles to grid v2
		for (const eo of engineObjects) {
			if (!(eo instanceof ObstacleEngineObject)) {
				continue;
			}

			const startX = eo.pos.x - eo.size.x / 2;
			const startY = eo.pos.y - eo.size.y / 2;
			const step = this._astarNodeSize;

			for (let x = startX; x < startX + eo.size.x; x += step) {
				for (let y = startY; y < startY + eo.size.y; y += step) {
					const worldPos = vec2(x, y);
					const astarPos = this.worldPosToAstarPos(worldPos);
					if (
						astarPos.x < 0 ||
						astarPos.x >= this._gridSize.x ||
						astarPos.y < 0 ||
						astarPos.y >= this._gridSize.y
					) {
						continue; // don't try to add obstacles outside the grid limits - duh.
					}

					const worldPosOfNearestAstarNode = this.astarPosToWorldPos(astarPos);
					if (
						posInRect(worldPosOfNearestAstarNode, eo.pos, eo.size)
						// isOverlapping(
						// 	eo.pos,
						// 	eo.size,
						// 	worldPosOfNearestAstarNode,
						// 	vec2(0.5, 0.5),
						// )
					) {
						this._grid.set([astarPos.x, astarPos.y], "value", 1);
						// debugRect(worldPosOfNearestCoords, vec2(1, 1), "#FFA500"); // orange
					}
				}
			}
		}

		this._astar = new Astar(this._grid);
	}
}
