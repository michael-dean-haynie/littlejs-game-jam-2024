import type { Vector2 } from "littlejsengine";
import { Message } from "./message";

export class ImpactUnitMessage extends Message {
	constructor(
		public readonly force: number,
		public readonly originPoint: Vector2,
		...params: ConstructorParameters<typeof Message>
	) {
		super(...params);
	}
}
