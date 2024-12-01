import { EngineObject, vec2 } from "littlejsengine";
import { v4 } from "uuid";
import type { MessageBroker } from "../message-broker";
import type { CreateUnitMessage } from "../messages/create-unit-message";
import { IsIssueOrderMessage } from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { MoveInDirectionOrder } from "../orders/move-in-direction-order";
import type { UnitType } from "../units/unit";
import { Actor } from "./actor";

export class UnitActor extends Actor {
	constructor(
		messageBroker: MessageBroker,
		createUnitActorMessage: CreateUnitMessage,
	) {
		super(messageBroker);

		// register message handlers
		this.handlers.set("IssueOrderMessage", this.handleIssueOrderMessage);

		// create engineObject
		this.engineObject = new EngineObject(
			createUnitActorMessage.position,
			vec2(1, 1),
		);

		this.unitId = v4();
		this.unitType = createUnitActorMessage.unitType;
	}

	readonly unitId: string;
	readonly unitType: UnitType;

	private engineObject: EngineObject;

	private handleIssueOrderMessage = (message: Message): void => {
		if (IsIssueOrderMessage(message)) {
			if (message.targetUnitId === this.unitId) {
				if (message.order instanceof MoveInDirectionOrder) {
					if (message.order.direction === "up") {
						this.engineObject.velocity = vec2(0, this.unitType.moveSpeed);
					}
					if (message.order.direction === "left") {
						this.engineObject.velocity = vec2(this.unitType.moveSpeed * -1, 0);
					}
					if (message.order.direction === "down") {
						this.engineObject.velocity = vec2(0, this.unitType.moveSpeed * -1);
					}
					if (message.order.direction === "right") {
						this.engineObject.velocity = vec2(this.unitType.moveSpeed, 0);
					}
					if (message.order.direction === "none") {
						this.engineObject.velocity = vec2(0, 0);
					}
				}
			}
		}
	};
}
