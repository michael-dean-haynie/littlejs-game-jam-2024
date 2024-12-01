import type { Vector2 } from "littlejsengine";
import { type UnitType, UnitTypes } from "../units/unit";
import type { Message, MessageType } from "./message";

export class CreateUnitMessage implements Message {
	constructor(args: Omit<CreateUnitMessage, "type">) {
		this.type = "CreateUnitMessage";
		this.unitType = args?.unitType;
		this.position = args?.position;
	}

	type: MessageType;
	unitType: UnitType;
	position: Vector2;
}

export function IsCreateUnitMessage(
	value: Message | null,
): value is CreateUnitMessage {
	return value?.type === "CreateUnitMessage";
}
