import type { Vector2 } from "littlejsengine";
import type { Team } from "../actors/player-actor";
import { type UnitType, UnitTypes } from "../units/unit";
import { Message } from "./message";

export class CreateUnitMessage extends Message {
	constructor(
		public readonly unitType: UnitType,
		public readonly position: Vector2,
		public readonly team: Team,
		...params: ConstructorParameters<typeof Message>
	) {
		super(...params);
	}
}
