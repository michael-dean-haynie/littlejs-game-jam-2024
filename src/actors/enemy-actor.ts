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
import { PathingActor } from "./pathing-actor";
import { UnitActor } from "./unit-actor";
import { WorldActor } from "./world-actor";

export class EnemyActor extends Actor {
	constructor(...params: ConstructorParameters<typeof Actor>) {
		super(...params);

		this.actorDirectory.registerActorAlias("enemyActor", this.actorId);

		this._unitCounts = createUnitCountMap();
		this._targetUnitCounts = createUnitCountMap();

		this._targetUnitCounts.rabbit = 10;
		this._targetUnitCounts.pig = 2;
	}

	private _unitCounts: UnitCountMap;
	private _targetUnitCounts: UnitCountMap;

	update(): void {
		super.update();

		for (const unitTypeName of UnitTypeNames) {
			if (
				this._unitCounts[unitTypeName] < this._targetUnitCounts[unitTypeName]
			) {
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
