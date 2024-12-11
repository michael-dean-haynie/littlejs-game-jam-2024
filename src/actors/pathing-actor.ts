import { Astar, Grid } from "fast-astar";
import {
	type Vector2,
	debugRect,
	engineObjects,
	isOverlapping,
	rand,
	randInt,
	vec2,
} from "littlejsengine";
import { createNoise2D } from "simplex-noise";
import { ObstacleEngineObject } from "../engine-objects/obstacle-engine-object";
import { PlayerObstacleEngineObject } from "../engine-objects/player-obstacle-engine-object";
import { TreeEngineObject } from "../engine-objects/tree-engine-object";
import type { UnitEngineObject } from "../engine-objects/unit-engine-object";
import type { Message } from "../messages/message";
import { roundToNearest, yeet } from "../utilities/utilities";
import { Actor } from "./actor";

export type AstarCoords = [x: number, y: number];

export class PathingActor extends Actor {
	constructor(
		public readonly worldSize: Vector2,
		public readonly arenaSize: Vector2,
		public readonly spawnAreaSize: number,
		public readonly worldCenter: Vector2,
		private readonly _astarNodeSize: number,
		...params: ConstructorParameters<typeof Actor>
	) {
		super(...params);
		this.actorDirectory.registerActorAlias("pathingActor", this.actorId);
		this._pathCache = new Map<number, Vector2[]>();
		this._grid = new Grid({ col: 10, row: 10 }); // will be replaced
		this._astar = new Astar(this._grid); // will be replaced

		this.generateObstacles();
		this.definePathingGrid();
	}

	private _pathCache: Map<number, Vector2[]>;

	private _grid: Grid;

	private _astar: Astar;

	protected handleMessage<T extends Message>(message: T): void {}

	getPath(origin: Vector2, destination: Vector2): Vector2[] {
		const originCoords = this.vec2ToCoords(origin, this._astarNodeSize);
		const destinationCoords = this.vec2ToCoords(
			destination,
			this._astarNodeSize,
		);

		// check cache
		const cacheKey = this.getCacheKey(
			originCoords[0],
			originCoords[1],
			destinationCoords[0],
			destinationCoords[1],
		);
		const cachedPath = this._pathCache.get(cacheKey);
		if (cachedPath) {
			return cachedPath;
		}

		// find path
		this.definePathingGrid(); // guess you gotta do it each time
		const astarPath =
			this._astar.search(originCoords, destinationCoords) ??
			yeet("UNEXPECTED_NULLISH_VALUE");

		const worldPath = astarPath.map((aspNode) =>
			this.coordsToVec2(aspNode, this._astarNodeSize),
		);

		this._pathCache.set(cacheKey, worldPath);

		return worldPath;
	}

	getRandomSpawnPoint(): Vector2 {
		let x: number;
		let y: number;

		// note the +/- 2's to avoid the world edge barriers
		const side = Math.floor(randInt(4));
		switch (side) {
			case 0: // top
				x = rand(0 + 2, this.worldSize.x - 2);
				y = rand(this.worldSize.y - this.spawnAreaSize, this.worldSize.y - 2);
				break;

			case 1: // right
				x = rand(this.worldSize.x - this.spawnAreaSize, this.worldSize.x - 2);
				y = rand(0 + 2, this.worldSize.y - 2);
				break;

			case 2: // bottom
				x = rand(0 + 2, this.worldSize.x - 2);
				y = rand(0 + 2, this.spawnAreaSize);
				break;

			case 3: // left
				x = rand(0 + 2, this.spawnAreaSize);
				y = rand(0 + 2, this.worldSize.y - 2);
				break;

			default:
				x = 2.5;
				y = 2.5;
		}

		return vec2(x, y);
	}

	/** converts a littlejs world Vector2 into Astar coordinates */
	private vec2ToCoords(vec: Vector2, astarNodeSize: number): AstarCoords {
		const xCoord = roundToNearest(vec.x, astarNodeSize) / astarNodeSize;
		const yCoord = roundToNearest(vec.y, astarNodeSize) / astarNodeSize;
		return [xCoord, yCoord];
	}

	/** converts Astar coordinates into a littlejs world Vector2 */
	private coordsToVec2(coords: AstarCoords, astarNodeSize: number): Vector2 {
		const [xCoord, yCoord] = coords;
		const x = xCoord * astarNodeSize;
		const y = yCoord * astarNodeSize;
		return vec2(x, y);
	}

	private getCacheKey(x1: number, y1: number, x2: number, y2: number): number {
		// return (((ox << 16) ^ oy) << 32) ^ ((dx << 16) ^ dy); // had collisions happening?
		// return (BigInt(x1) << 48n) | (BigInt(y1) << 32n) | (BigInt(x2) << 16n) | BigInt(y2); // requires latest js version
		// return `${x1},${y1},${x2},${y2}`; // works, maybe not super efficient
		return x1 * 1000000 + y1 * 10000 + x2 * 100 + y2; // good as long as grid doesn't exceed 100x100
	}

	private generateObstacles() {
		// install player obstacles at arena edges (just outside of arena size)
		const left = new PlayerObstacleEngineObject(
			vec2(
				this.worldCenter.x - this.arenaSize.x / 2 - 0.5,
				this.worldSize.y / 2,
			),
			vec2(1, this.arenaSize.y),
		);
		const right = new PlayerObstacleEngineObject(
			vec2(
				this.worldCenter.x + this.arenaSize.x / 2 + 0.5,
				this.worldSize.y / 2,
			),
			vec2(1, this.arenaSize.y),
		);
		const top = new PlayerObstacleEngineObject(
			vec2(
				this.worldSize.x / 2,
				this.worldCenter.y + this.arenaSize.y / 2 + 0.5,
			),
			vec2(this.arenaSize.x, 1),
		);
		const bottom = new PlayerObstacleEngineObject(
			vec2(
				this.worldSize.x / 2,
				this.worldCenter.y - this.arenaSize.y / 2 - 0.5,
			),
			vec2(this.arenaSize.x, 1),
		);

		// install obstacles at world edges (taking up 1 space just inside world size because barriers need registered by astar pathing grid)
		const wLeft = new ObstacleEngineObject(
			false,
			vec2(0.5, this.worldSize.y / 2),
			vec2(1, this.worldSize.y),
		);
		const wRight = new ObstacleEngineObject(
			false,
			vec2(this.worldSize.x - 0.5, this.worldSize.y / 2),
			vec2(1, this.worldSize.y),
		);
		const wTop = new ObstacleEngineObject(
			false,
			vec2(this.worldSize.x / 2, this.worldSize.y - 0.5),
			vec2(this.worldSize.x, 1),
		);
		const wBottom = new ObstacleEngineObject(
			false,
			vec2(this.worldSize.x / 2, 0.5),
			vec2(this.worldSize.x, 1),
		);

		// TRYING OUT SIMPLEX NOISE
		const noise2d = createNoise2D();
		for (let x = 0; x < this.worldSize.x; x++) {
			for (let y = 0; y < this.worldSize.y; y++) {
				// console.log(`(${x},${y}): ${noise2d(x, y)}`);
				const value = noise2d(x, y);
				if (value > 0.75) {
					const obstacle = new TreeEngineObject(true, vec2(x, y), vec2(1, 1));
				}
			}
		}
	}

	private definePathingGrid(): void {
		// define grid
		const gridColumns = this.worldSize.x / this._astarNodeSize;
		const gridRows = this.worldSize.y / this._astarNodeSize;
		this._grid = new Grid({
			col: gridColumns,
			row: gridRows,
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
					const coords = this.vec2ToCoords(worldPos, this._astarNodeSize);
					if (
						coords[0] < 0 ||
						coords[0] >= gridColumns ||
						coords[1] < 0 ||
						coords[1] >= gridRows
					) {
						continue; // don't try to add obstacles outside the grid limits - duh.
					}

					const worldPosOfNearestCoords = this.coordsToVec2(
						coords,
						this._astarNodeSize,
					);
					if (
						isOverlapping(
							eo.pos,
							eo.size,
							worldPosOfNearestCoords,
							vec2(0.5, 0.5),
						)
					) {
						this._grid.set(coords, "value", 1);
						// debugRect(worldPosOfNearestCoords, vec2(1, 1), "#FFA500"); // orange
					}
				}
			}
		}

		this._astar = new Astar(this._grid);
	}
}
