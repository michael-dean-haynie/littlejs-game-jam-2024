import type { Vector2 } from "littlejsengine";
import { type UnitType, UnitTypes } from "../units/unit";
import type { Message, MessageType } from "./message";

export const Teams = ["player", "enemy"] as const;
export type Team = (typeof Teams)[number];

export function IsTeam(value: string | null): value is Team {
	return Teams.includes(value as Team);
}

export class CreateUnitMessage implements Message {
	constructor(args: Omit<CreateUnitMessage, "type">) {
		this.type = "CreateUnitMessage";
		this.unitType = args?.unitType;
		this.position = args?.position;
		this.team = args?.team;
	}

	type: MessageType;
	unitType: UnitType;
	position: Vector2;
	team: Team;
}

export function IsCreateUnitMessage(
	value: Message | null,
): value is CreateUnitMessage {
	return value?.type === "CreateUnitMessage";
}
