import { Astar, Grid } from "fast-astar";
import {
	EngineObject,
	type Vector2,
	debugRect,
	engineObjects,
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
		private readonly _astarNodeSize: number,
	) {}

	getPath(
		origin: Vector2,
		destination: Vector2,
		unitEngineObject: UnitEngineObject,
	): Vector2[] {
		// define grid
		const grid = new Grid({
			col: this.worldSize.x / this._astarNodeSize,
			row: this.worldSize.y / this._astarNodeSize,
		});

		// add obstacles to grid
		for (const engObj of engineObjects) {
			if (
				IsPathingAwareEngineObject(engObj) &&
				!engObj.isPathable(unitEngineObject)
			) {
				// foreach astar grid node that the unpathable engine object covers ...
				for (let x = 0; x < engObj.size.x; x += this._astarNodeSize) {
					for (let y = 0; y < engObj.size.y; y += this._astarNodeSize) {
						// set node as obstacle in astar grid
						const worldPosVector = vec2(
							engObj.pos.x - this._astarNodeSize / 2 + x,
							engObj.pos.y - this._astarNodeSize / 2 + y,
						);
						const astarPosVector = vec2ToCoords(
							worldPosVector,
							this._astarNodeSize,
						);
						grid.set(astarPosVector, "value", 1);
						// debugRect(
						// 	coordsToVec2(astarPosVector, this._astarNodeSize),
						// 	vec2(this._astarNodeSize, this._astarNodeSize),
						// 	"#FFA500",
						// );
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
