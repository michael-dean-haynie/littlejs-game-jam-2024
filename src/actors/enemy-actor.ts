import { vec2 } from "littlejsengine";
import type { MessageBroker } from "../message-broker";
import {
	CreateUnitMessage,
	IsCreateUnitMessage,
} from "../messages/create-unit-message";
import { IssueOrderMessage } from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { FollowUnitOrder } from "../orders/follow-unit-order";
import { UnitTypes } from "../units/unit";
import { Actor } from "./actor";
import { UnitActor } from "./unit-actor";

export class EnemyActor extends Actor {
	constructor(messageBroker: MessageBroker) {
		super(messageBroker);

		// register message handlers
		this.handlers.set("CreateUnitMessage", this.handleCreateUnitMessage);

		// create some units for now
		this.messageBroker.publish(
			new CreateUnitMessage({
				unitType: UnitTypes.bunny,
				position: vec2(40, 40),
				team: "enemy",
			}),
		);

		this.messageBroker.publish(
			new CreateUnitMessage({
				unitType: UnitTypes.bunny,
				position: vec2(60, 60),
				team: "enemy",
			}),
		);
		this.messageBroker.publish(
			new CreateUnitMessage({
				unitType: UnitTypes.pig,
				position: vec2(40, 60),
				team: "enemy",
			}),
		);
	}

	private handleCreateUnitMessage = (message: Message): void => {
		if (IsCreateUnitMessage(message)) {
			if (message.team === "enemy") {
				const unitActor = new UnitActor(this.messageBroker, message);
				this.messageBroker.publish(
					new IssueOrderMessage({
						order: new FollowUnitOrder({
							targetUnitId: this.messageBroker.playerActor.playerUnitId,
						}),
						orderedUnitId: unitActor.unitId,
					}),
				);
			}
		}
	};
}
