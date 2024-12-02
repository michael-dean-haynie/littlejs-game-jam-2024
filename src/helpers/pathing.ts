import { Astar, Grid } from "fast-astar";
import { type Vector2, debugRect, vec2 } from "littlejsengine";
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
		private readonly _worldSize: Vector2,
		private readonly _astarNodeSize: number,
	) {}

	getPath(origin: Vector2, destination: Vector2): Vector2[] {
		const grid = new Grid({
			col: this._worldSize.x / this._astarNodeSize,
			row: this._worldSize.y / this._astarNodeSize,
		});
		// grid.set([1, 1], "value", 1)
		const astar = new Astar(grid);
		const astarPath =
			astar.search(
				vec2ToCoords(origin, this._astarNodeSize),
				vec2ToCoords(destination, this._astarNodeSize),
			) ?? yeet("UNEXPECTED_NULLISH_VALUE");
		// console.log({ astarPath });

		const worldPath = astarPath.map((aspNode) =>
			coordsToVec2(aspNode, this._astarNodeSize),
		);
		// console.log({ worldPath });

		for (const wpNode of worldPath) {
			// debugRect(
			// 	wpNode,
			// 	vec2(this._astarNodeSize, this._astarNodeSize),
			// 	"#fff",
			// 	5,
			// );
		}

		return worldPath;
	}
}
