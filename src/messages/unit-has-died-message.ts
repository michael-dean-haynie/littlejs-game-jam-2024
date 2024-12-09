import type { Team } from "../actors/player-actor";
import type { UnitType } from "../units/unit";
import { Message } from "./message";

export class UnitHasDiedMessage extends Message {
	constructor(
		public readonly deadUnitActorId: string,
		public readonly deadUnitType: UnitType,
		public readonly deadUnitTeam: Team,
		public readonly killingUnitActorId: string,
		public readonly killingUnitType: UnitType,
		public readonly killingUnitTeam: Team,
	) {
		super();
	}
}
