import { EngineObject, vec2 } from "littlejsengine";
import type { ActorMessageBroker } from "../actor-message-broker";
import type { CreateUnitMessage } from "../messages/create-unit-message";
import { Actor } from "./actor";

export class UnitActor extends Actor {
	constructor(
		actorMessageBroker: ActorMessageBroker,
		createUnitActorMessage: CreateUnitMessage,
	) {
		super(actorMessageBroker);

		// register message handlers
		// this.handlers.set("CreateUnitMessage", this.handleCreateUnitMessage);

		// create engineObject
		this.engineObject = new EngineObject(
			createUnitActorMessage.position,
			vec2(1, 1),
		);
	}

	private engineObject: EngineObject;

	// private handleCreateUnitMessage(message: Message): void {
	// 	console.log("handling message:", message);
	// }
}
