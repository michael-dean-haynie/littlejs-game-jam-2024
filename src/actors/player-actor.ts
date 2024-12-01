import { vec2 } from "littlejsengine";
import type { ActorMessageBroker } from "../actor-message-broker";
import {
	CreateUnitMessage,
	IsCreateUnitMessage,
} from "../messages/create-unit-message";
import type { Message } from "../messages/message";
import { UnitTypes } from "../units/unit";
import { Actor } from "./actor";
import { UnitActor } from "./unit-actor";

export class PlayerActor extends Actor {
	constructor(actorMessageBroker: ActorMessageBroker) {
		super(actorMessageBroker);

		// register message handlers
		this.handlers.set("CreateUnitMessage", this.handleCreateUnitMessage);

		// create unit for player
		this.actorMessageBroker.publish(
			new CreateUnitMessage({
				unitType: UnitTypes.prey,
				position: vec2(50, 50),
			}),
		);
	}

	private handleCreateUnitMessage = (message: Message): void => {
		if (IsCreateUnitMessage(message)) {
			const unitActor = new UnitActor(this.actorMessageBroker, message);
		}
	};
}
