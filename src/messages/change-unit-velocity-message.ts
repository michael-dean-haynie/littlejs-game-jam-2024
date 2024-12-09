import type { Vector2 } from "littlejsengine";
import { Message } from "./message";

export class ChangeUnitVelocityMessage extends Message {
	constructor(
		public readonly velocity: Vector2,
		public readonly updateFacingAngle: boolean,
	) {
		super();
	}
}
