import { vec2 } from "littlejsengine";
import type { Game } from "../game/game";
import type { GameScore } from "../game/game-score";
import type { RoundScore } from "../game/round-score";
import type { Message } from "../messages/message";
import { PlayerFiredWeaponMessage } from "../messages/player-fired-weapon-message";
import { UnitHasDiedMessage } from "../messages/unit-has-died-message";
import { UnitTypes } from "../units/unit";
import { Actor } from "./actor";
import { UnitActor } from "./unit-actor";

export class PlayerActor extends Actor {
	constructor(
		private readonly _game: Game,
		private readonly _gameScore: GameScore,
		...params: ConstructorParameters<typeof Actor>
	) {
		super(...params);
		this.actorDirectory.registerActorAlias("playerActor", this.actorId);

		// create prey unit
		const unitActor = new UnitActor(
			this._gameScore,
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
	}

	protected handleMessage<T extends Message>(message: T): void {
		if (message instanceof UnitHasDiedMessage) {
			this.handleUnitHasDiedMessage(message);
		}
		if (message instanceof PlayerFiredWeaponMessage) {
			this.handlePlayerFiredWeaponMessage(message);
		}
	}

	private handleUnitHasDiedMessage(message: UnitHasDiedMessage): void {
		if (message.deadUnitTeam === "player") {
			this._game.endRound();
		}
		if (message.deadUnitTeam === "enemy") {
			this._gameScore.curRoundScore.kills[message.deadUnitType.name] += 1;
		}
	}

	private handlePlayerFiredWeaponMessage(
		message: PlayerFiredWeaponMessage,
	): void {
		this._gameScore.curRoundScore.shots[message.weaponTypeName] += 1;
	}
}

export const Teams = ["player", "enemy"] as const;
export type Team = (typeof Teams)[number];

export function IsTeam(value: string | null): value is Team {
	return Teams.includes(value as Team);
}
