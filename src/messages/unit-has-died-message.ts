import type { UnitType } from "../units/unit";
import type { Team } from "./create-unit-message";
import type { Message, MessageType } from "./message";

export class UnitHasDiedMessage implements Message {
	constructor(args: Omit<UnitHasDiedMessage, "type">) {
		this.type = "UnitHasDiedMessage";
		this.deadUnitId = args?.deadUnitId;
		this.deadUnitType = args?.deadUnitType;
		this.deadUnitTeam = args?.deadUnitTeam;
		this.killingUnitId = args?.killingUnitId;
		this.killingUnitType = args?.killingUnitType;
		this.killingUnitTeam = args?.killingUnitTeam;
	}

	type: MessageType;
	deadUnitId: string;
	deadUnitType: UnitType;
	deadUnitTeam: Team;
	killingUnitId: string;
	killingUnitType: UnitType;
	killingUnitTeam: Team;
}
