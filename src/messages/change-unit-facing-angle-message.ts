import type { Vector2 } from "littlejsengine";
import { Message } from "./message";

export class ChangeUnitFacingAngleMessage extends Message {
	constructor(public readonly angle: number) {
		super();
	}
}
