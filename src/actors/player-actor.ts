import { vec2 } from "littlejsengine";
import type { Game } from "../game/game";
import { Score } from "../game/score";
import type { Message } from "../messages/message";
import { UnitHasDiedMessage } from "../messages/unit-has-died-message";
import { UnitTypes } from "../units/unit";
import { yeet } from "../utilities/utilities";
import { Actor } from "./actor";
import { PathingActor } from "./pathing-actor";
import { UnitActor } from "./unit-actor";

export class PlayerActor extends Actor {
	constructor(
		private readonly _game: Game,
		...params: ConstructorParameters<typeof Actor>
	) {
		super(...params);
		this.actorDirectory.registerActorAlias("playerActor", this.actorId);

		// create prey unit
		const unitActor = new UnitActor(
			UnitTypes.prey,
			vec2(0, 0),
			"player",
			this.actorDirectory,
			this.messageBroker,
		);
		this.actorDirectory.registerActorAlias(
			"playerUnitActor",
			unitActor.actorId,
		);

		this.score = new Score();
	}

	/** the score for the single round that this player obj exists */
	readonly score: Score;

	protected handleMessage<T extends Message>(message: T): void {
		if (message instanceof UnitHasDiedMessage) {
			this.handleUnitHasDiedMessage(message);
		}
	}

	private handleUnitHasDiedMessage(message: UnitHasDiedMessage): void {
		if (message.deadUnitTeam === "player") {
			this._game.endRound();
		}
		if (message.deadUnitTeam === "enemy") {
			this.score.kills[message.deadUnitType.name] += 1;
		}
	}
}

export const Teams = ["player", "enemy"] as const;
export type Team = (typeof Teams)[number];

export function IsTeam(value: string | null): value is Team {
	return Teams.includes(value as Team);
}
