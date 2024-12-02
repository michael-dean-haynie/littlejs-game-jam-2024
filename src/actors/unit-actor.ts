import { EngineObject, vec2 } from "littlejsengine";
import { v4 } from "uuid";
import { PathingHelper } from "../helpers/pathing";
import type { MessageBroker } from "../message-broker";
import type { CreateUnitMessage } from "../messages/create-unit-message";
import { IsIssueOrderMessage } from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { FollowUnitOrder } from "../orders/follow-unit-order";
import { MoveInDirectionOrder } from "../orders/move-in-direction-order";
import type { Order } from "../orders/order";
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

		this.unitId = v4();
		this.unitType = createUnitActorMessage.unitType;
		this._orderQueue = [];

		// create engineObject
		this._engineObject = new EngineObject(
			createUnitActorMessage.position,
			vec2(1, 1),
			undefined,
			undefined,
			this.unitType.color,
		);
		this._engineObject.setCollision(); // turn collision on
	}

	readonly unitId: string;
	readonly unitType: UnitType;

	private _engineObject: EngineObject;
	private _orderQueue: Order[];

	update(): void {
		super.update();

		// process order queue
		let noActionYet = true;
		while (this._orderQueue.length && noActionYet) {
			const order = this._orderQueue[0];
			// TODO: wacky order param
			if (order.hasCompleted(order)) {
				this._orderQueue.shift();
			} else {
				this.executeOrder(order);
				noActionYet = false;
			}
		}
	}

	private executeOrder(order: Order): void {
		if (order instanceof MoveInDirectionOrder) {
			if (order.direction === "up") {
				this._engineObject.velocity = vec2(0, this.unitType.moveSpeed);
			}
			if (order.direction === "left") {
				this._engineObject.velocity = vec2(this.unitType.moveSpeed * -1, 0);
			}
			if (order.direction === "down") {
				this._engineObject.velocity = vec2(0, this.unitType.moveSpeed * -1);
			}
			if (order.direction === "right") {
				this._engineObject.velocity = vec2(this.unitType.moveSpeed, 0);
			}
			if (order.direction === "none") {
				this._engineObject.velocity = vec2(0, 0);
			}
		}

		if (order instanceof FollowUnitOrder) {
			const targetUnitActor = this.messageBroker.getUnitActorById(
				order.targetUnitId,
			);
			const targetUnitPos = targetUnitActor._engineObject.pos;
			const path = this.messageBroker.pathingHelper.getPath(
				this._engineObject.pos,
				targetUnitPos,
			);

			const node = path.length > 1 ? path[1] : path[0]; // skip first path node (cause it was rounded to snap to grid)
			const direction = node.subtract(this._engineObject.pos);
			this._engineObject.velocity = direction.normalize(
				this.unitType.moveSpeed,
			);
		}
	}

	private handleIssueOrderMessage = (message: Message): void => {
		if (IsIssueOrderMessage(message)) {
			if (message.orderedUnitId === this.unitId) {
				if (message.order instanceof MoveInDirectionOrder) {
					this._orderQueue.length = 0; // empty queue whilst preserving reference
					this._orderQueue.unshift(message.order);
				}

				if (message.order instanceof FollowUnitOrder) {
					this._orderQueue.length = 0; // empty queue whilst preserving reference
					this._orderQueue.unshift(message.order);
				}
			}
		}
	};
}
