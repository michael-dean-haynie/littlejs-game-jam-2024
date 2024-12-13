import type { Vector2 } from "littlejsengine";
import { Message } from "./message";

export class FireWeaponMessage extends Message {
	constructor(public readonly targetPos: Vector2) {
		super();
	}
}
