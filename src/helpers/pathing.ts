import { Astar, Grid } from "fast-astar";
import {
	type Vector2,
	engineObjects,
	isOverlapping,
	vec2,
} from "littlejsengine";
import { IsPathingAwareEngineObject } from "../engine-objects/pathing-aware-engine-object";
import type { UnitEngineObject } from "../engine-objects/unit-engine-object";
import { roundToNearest, yeet } from "../utilities/utilities";

export type AstarCoords = [x: number, y: number];

/** converts a littlejs world Vector2 into Astar coordinates */
export function vec2ToCoords(vec: Vector2, astarNodeSize: number): AstarCoords {
	const xCoord = roundToNearest(vec.x, astarNodeSize) / astarNodeSize;
	const yCoord = roundToNearest(vec.y, astarNodeSize) / astarNodeSize;
	return [xCoord, yCoord];
}

/** converts Astar coordinates into a littlejs world Vector2 */
export function coordsToVec2(
	coords: AstarCoords,
	astarNodeSize: number,
): Vector2 {
	const [xCoord, yCoord] = coords;
	const x = xCoord * astarNodeSize;
	const y = yCoord * astarNodeSize;
	return vec2(x, y);
}

export class PathingHelper {
	constructor(
		public readonly worldSize: Vector2,
		public readonly arenaSize: Vector2,
		public readonly spawnAreaSize: number,
		public readonly worldCenter: Vector2,
		private readonly _astarNodeSize: number,
	) {}

	getPath(
		origin: Vector2,
		destination: Vector2,
		unitEngineObject: UnitEngineObject,
	): Vector2[] {
		// define grid
		const gridColumns = this.worldSize.x / this._astarNodeSize;
		const gridRows = this.worldSize.y / this._astarNodeSize;
		const grid = new Grid({
			col: gridColumns,
			row: gridRows,
		});

		// add obstacles to grid v2
		for (const eo of engineObjects) {
			if (!IsPathingAwareEngineObject(eo) || eo.isPathable(unitEngineObject)) {
				continue;
			}

			const startX = eo.pos.x - eo.size.x / 2;
			const startY = eo.pos.x - eo.size.x / 2;
			const step = this._astarNodeSize;

			for (let xOffset = startX; xOffset < eo.size.x; xOffset += step) {
				for (let yOffset = startY; yOffset < eo.size.y; yOffset += step) {
					const worldPos = eo.pos.add(vec2(xOffset, yOffset));
					const coords = vec2ToCoords(worldPos, this._astarNodeSize);
					if (
						coords[0] < 0 ||
						coords[0] >= gridColumns ||
						coords[1] < 0 ||
						coords[1] >= gridRows
					) {
						continue; // don't try to add obstacles outside the grid limits - duh.
					}

					const worldPosOfNearestCoords = coordsToVec2(
						coords,
						this._astarNodeSize,
					);
					if (
						isOverlapping(eo.pos, eo.size, worldPosOfNearestCoords, vec2(0, 0))
					) {
						grid.set(coords, "value", 1);
					}
				}
			}
		}

		// find path
		const astar = new Astar(grid);
		const astarPath =
			astar.search(
				vec2ToCoords(origin, this._astarNodeSize),
				vec2ToCoords(destination, this._astarNodeSize),
			) ?? yeet("UNEXPECTED_NULLISH_VALUE");

		const worldPath = astarPath.map((aspNode) =>
			coordsToVec2(aspNode, this._astarNodeSize),
		);

		for (const wpNode of worldPath) {
			// debugRect(wpNode, vec2(this._astarNodeSize, this._astarNodeSize), "#fff");
		}

		return worldPath;
	}
}
