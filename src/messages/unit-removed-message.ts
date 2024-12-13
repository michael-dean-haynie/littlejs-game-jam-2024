import type { Team } from "../actors/player-actor";
import type { UnitType } from "../units/unit";
import { Message } from "./message";

export class UnitRemovedMessage extends Message {
	constructor(
		public readonly removedUnitActorId: string,
		public readonly removedUnitType: UnitType,
		public readonly removedUnitTeam: Team,
	) {
		super();
	}
}
