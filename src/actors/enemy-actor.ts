import type { Game } from "../game/game";
import type { GameScore } from "../game/game-score";
import { IssueOrderMessage } from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { UnitHasDiedMessage } from "../messages/unit-has-died-message";
import { UnitRemovedMessage } from "../messages/unit-removed-message";
import { AttackUnitOrder } from "../orders/attack-unit-order";
import {
	type UnitCountMap,
	type UnitTypeName,
	UnitTypeNames,
	UnitTypes,
	createUnitCountMap,
} from "../units/unit";
import { yeet } from "../utilities/utilities";
import { Actor } from "./actor";
import { UnitActor } from "./unit-actor";
import { WorldActor } from "./world-actor";

export class EnemyActor extends Actor {
	constructor(
		private readonly _game: Game,
		private readonly _gameScore: GameScore,
		...params: ConstructorParameters<typeof Actor>
	) {
		super(...params);

		this.actorDirectory.registerActorAlias("enemyActor", this.actorId);

		this._unitCounts = createUnitCountMap();
		this._targetUnitCounts = createUnitCountMap();

		this._targetUnitCounts.mouse = 10;
		this._targetUnitCounts.rabbit = 5;
		this._targetUnitCounts.pig = 2;
		this._lastDifficultyCheck = Date.now();

		this._gameScore.difficulty *= 0.9; // start a little easier than last left off
	}

	private _unitCounts: UnitCountMap;
	private _targetUnitCounts: UnitCountMap;
	private _lastDifficultyCheck: number;

	update(): void {
		super.update();

		if (Date.now() - this._lastDifficultyCheck > 6_000) {
			this._lastDifficultyCheck = Date.now();
			this._gameScore.difficulty += 0.1;
		}

		for (const unitTypeName of UnitTypeNames) {
			const currentCount = this._unitCounts[unitTypeName];
			const adjTarget = Math.floor(
				this._targetUnitCounts[unitTypeName] * this._gameScore.difficulty,
			);
			if (currentCount < adjTarget) {
				this.spawnEnemyUnit(unitTypeName);
			}
		}
	}

	protected handleMessage<T extends Message>(message: T): void {
		if (message instanceof UnitHasDiedMessage) {
			this.handleUnitHasDiedMessage(message);
		}
		if (message instanceof UnitRemovedMessage) {
			this.handleUnitRemovedMessage(message);
		}
	}

	private handleUnitHasDiedMessage(message: UnitHasDiedMessage): void {
		if (message.deadUnitTeam === "enemy") {
			this._unitCounts[message.deadUnitType.name] -= 1;
		}
	}

	private handleUnitRemovedMessage(message: UnitRemovedMessage): void {
		if (message.removedUnitTeam === "enemy") {
			this._unitCounts[message.removedUnitType.name] -= 1;
		}
	}

	private spawnEnemyUnit(unitTypeName: UnitTypeName): void {
		const worldActor =
			this.actorDirectory.getActorByAlias("worldActor", WorldActor) ?? yeet();

		const playerUnitActor =
			this.actorDirectory.getActorByAlias("playerUnitActor", UnitActor) ??
			yeet();

		// spawn
		const unitActor = new UnitActor(
			this._gameScore,
			UnitTypes[unitTypeName],
			worldActor.getRandomSpawnPos(),
			"enemy",
			this.actorDirectory,
			this.messageBroker,
		);

		// attack
		this.messageBroker.publishMessage(
			new IssueOrderMessage(
				new AttackUnitOrder(
					this.actorDirectory,
					this.messageBroker,
					playerUnitActor.actorId,
				),
			),
			{
				actorIds: [unitActor.actorId],
			},
		);

		this._unitCounts[unitTypeName] += 1;
	}
}
