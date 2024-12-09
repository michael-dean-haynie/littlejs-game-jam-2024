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

		const pathingActor =
			this.actorDirectory.getActorByAlias("pathingActor", PathingActor) ??
			yeet("UNEXPECTED_NULLISH_VALUE");

		const playerUnitActor =
			this.actorDirectory.getActorByAlias("playerUnitActor", UnitActor) ??
			yeet("UNEXPECTED_NULLISH_VALUE");

		// create enemy units
		const unitActor1 = new UnitActor(
			UnitTypes.rabbit,
			pathingActor.worldCenter.add(vec2(-5, -5)),
			"enemy",
			this.actorDirectory,
			this.messageBroker,
		);
		const unitActor2 = new UnitActor(
			UnitTypes.rabbit,
			pathingActor.worldCenter.add(vec2(5, 5)),
			"enemy",
			this.actorDirectory,
			this.messageBroker,
		);
		const unitActor3 = new UnitActor(
			UnitTypes.pig,
			pathingActor.worldCenter.add(vec2(-5, 5)),
			"enemy",
			this.actorDirectory,
			this.messageBroker,
		);
		const unitActor4 = new UnitActor(
			UnitTypes.pig,
			pathingActor.worldCenter.add(vec2(5, -5)),
			"enemy",
			this.actorDirectory,
			this.messageBroker,
		);

		for (const unit of [unitActor1, unitActor2, unitActor3, unitActor4]) {
			this.messageBroker.publishMessage(
				new IssueOrderMessage(
					new AttackUnitOrder(
						this.actorDirectory,
						this.messageBroker,
						playerUnitActor.actorId,
					),
				),
				{
					actorType: UnitActor,
					actorIds: [unit.actorId],
				},
			);
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
}
