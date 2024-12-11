import { vec2 } from "littlejsengine";
import { IssueOrderMessage } from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { UnitHasDiedMessage } from "../messages/unit-has-died-message";
import { AttackUnitOrder } from "../orders/attack-unit-order";
import { type UnitTypeName, UnitTypeNames, UnitTypes } from "../units/unit";
import { yeet } from "../utilities/utilities";
import { Actor } from "./actor";
import { PathingActor } from "./pathing-actor";
import { UnitActor } from "./unit-actor";

export type UnitCountMap = {
	[K in UnitTypeName]: number;
};

export function createUnitCountMap(): UnitCountMap {
	const map: Partial<UnitCountMap> = {};
	for (const unitTypeName of UnitTypeNames) {
		map[unitTypeName] = 0;
	}
	return map as UnitCountMap;
}

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
	}

	private handleUnitHasDiedMessage(message: UnitHasDiedMessage): void {
		if (message.deadUnitTeam === "enemy") {
			this._unitCounts[message.deadUnitType.name] -= 1;
		}
	}

	private spawnEnemyUnit(unitTypeName: UnitTypeName): void {
		const pathingActor =
			this.actorDirectory.getActorByAlias("pathingActor", PathingActor) ??
			yeet();

		const playerUnitActor =
			this.actorDirectory.getActorByAlias("playerUnitActor", UnitActor) ??
			yeet();

		// spawn
		const unitActor = new UnitActor(
			UnitTypes[unitTypeName],
			pathingActor.getRandomSpawnPoint(),
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
