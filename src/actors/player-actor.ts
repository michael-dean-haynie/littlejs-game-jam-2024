import type { Message } from "../messages/message";
import { UnitHasDiedMessage } from "../messages/unit-has-died-message";
import { UnitTypes } from "../units/unit";
import { yeet } from "../utilities/utilities";
import { Actor } from "./actor";
import { PathingActor } from "./pathing-actor";
import { UnitActor } from "./unit-actor";

export class PlayerActor extends Actor {
	constructor(...params: ConstructorParameters<typeof Actor>) {
		super(...params);
		this.actorDirectory.registerActorAlias("playerActor", this.actorId);

		const pathingActor =
			this.actorDirectory.getActorByAlias("pathingActor", PathingActor) ??
			yeet("UNEXPECTED_NULLISH_VALUE");

		// create prey unit
		const unitActor = new UnitActor(
			UnitTypes.prey,
			pathingActor.worldCenter,
			"player",
			this.actorDirectory,
			this.messageBroker,
		);
		this.actorDirectory.registerActorAlias(
			"playerUnitActor",
			unitActor.actorId,
		);
	}

	protected handleMessage<T extends Message>(message: T): void {
		if (message instanceof UnitHasDiedMessage) {
			this.handleUnitHasDiedMessage(message);
		}
	}

	private handleUnitHasDiedMessage(message: UnitHasDiedMessage): void {
		if (message.deadUnitTeam === "player") {
			// lose the round?
		}
		if (message.deadUnitTeam === "enemy") {
			// increase the player points?
		}
	}
}

export const Teams = ["player", "enemy"] as const;
export type Team = (typeof Teams)[number];

export function IsTeam(value: string | null): value is Team {
	return Teams.includes(value as Team);
}
