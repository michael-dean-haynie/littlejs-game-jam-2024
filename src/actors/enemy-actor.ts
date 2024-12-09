import { vec2 } from "littlejsengine";
import { IssueOrderMessage } from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { UnitHasDiedMessage } from "../messages/unit-has-died-message";
import { AttackUnitOrder } from "../orders/attack-unit-order";
import { UnitTypes } from "../units/unit";
import { yeet } from "../utilities/utilities";
import { Actor } from "./actor";
import { PathingActor } from "./pathing-actor";
import { UnitActor } from "./unit-actor";

export class EnemyActor extends Actor {
	constructor(...params: ConstructorParameters<typeof Actor>) {
		super(...params);

		this.actorDirectory.registerActorAlias("enemyActor", this.actorId);
		this._targetActorCount = 50;
	}

	private _targetActorCount: number;

	update(): void {
		super.update();

		if (
			this.actorDirectory.getActorsByType(UnitActor).size <
			this._targetActorCount
		) {
			this.spawnEnemy();
		}
	}

	protected handleMessage<T extends Message>(message: T): void {
		if (message instanceof UnitHasDiedMessage) {
			this.handleUnitHasDiedMessage(message);
		}
	}

	private handleUnitHasDiedMessage(message: UnitHasDiedMessage): void {
		if (message.deadUnitTeam === "enemy") {
			// make another one?
		}
	}

	private spawnEnemy(): void {
		const pathingActor =
			this.actorDirectory.getActorByAlias("pathingActor", PathingActor) ??
			yeet("UNEXPECTED_NULLISH_VALUE");

		const playerUnitActor =
			this.actorDirectory.getActorByAlias("playerUnitActor", UnitActor) ??
			yeet("UNEXPECTED_NULLISH_VALUE");

		// spawn
		const unitActor = new UnitActor(
			UnitTypes.rabbit,
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
	}
}
