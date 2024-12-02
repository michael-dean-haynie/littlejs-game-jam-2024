import {
	EngineObject,
	type Vector2,
	debugRect,
	isOverlapping,
	vec2,
} from "littlejsengine";
import { v4 } from "uuid";
import type { MessageBroker } from "../message-broker";
import type { CreateUnitMessage } from "../messages/create-unit-message";
import {
	IsIssueOrderMessage,
	IssueOrderMessage,
} from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { AttackOrder } from "../orders/attack-order";
import { FollowUnitOrder } from "../orders/follow-unit-order";
import { MoveInDirectionOrder } from "../orders/move-in-direction-order";
import type { Order } from "../orders/order";
import { StopMovingOrder } from "../orders/stop-moving-order";
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
		this._facingDirection = 2;

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
	private _facingDirection: number;

	update(): void {
		super.update();

		// process order queue
		if (this._orderQueue.length) {
			// try to execute order
			const order = this._orderQueue[0];
			this.executeOrder(order);

			// if it completed, remove it from the queue
			if (order.progress === "complete") {
				this._orderQueue.shift();
			}
		}
	}

	doesOverlap(point: Vector2, size: number): boolean {
		return isOverlapping(
			point,
			vec2(size),
			this._engineObject.pos,
			vec2(this.unitType.size),
		);
	}

	applyForce(force: Vector2): void {
		this.messageBroker.publish(
			new IssueOrderMessage({
				order: new StopMovingOrder(),
				orderedUnitId: this.unitId,
			}),
		);
		this._engineObject.applyAcceleration(force);
	}

	private handleIssueOrderMessage = (message: Message): void => {
		if (IsIssueOrderMessage(message)) {
			if (message.orderedUnitId === this.unitId) {
				if (message.order instanceof MoveInDirectionOrder) {
					this._orderQueue.length = 0; // empty queue whilst preserving reference
					this._orderQueue.unshift(message.order);
				}

				if (message.order instanceof StopMovingOrder) {
					this._orderQueue.length = 0; // empty queue whilst preserving reference
					this._orderQueue.unshift(message.order);
				}

				if (message.order instanceof FollowUnitOrder) {
					this._orderQueue.length = 0; // empty queue whilst preserving reference
					this._orderQueue.unshift(message.order);
				}

				if (message.order instanceof AttackOrder) {
					this._orderQueue.unshift(message.order);
				}
			}
		}
	};

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
			this._facingDirection = this._engineObject.velocity.direction();
			order.progress = "in progress";
		}

		if (order instanceof StopMovingOrder) {
			this._engineObject.velocity = vec2(0, 0);
			order.progress = "complete";
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
			this._facingDirection = this._engineObject.velocity.direction();

			order.progress = "in progress";
		}

		if (order instanceof AttackOrder) {
			console.log("BANG");
			const target = vec2()
				.setDirection(this._facingDirection, this.unitType.size)
				.add(this._engineObject.pos);

			debugRect(target, vec2(1, 1));

			const hitActors = this.messageBroker.getUnitActorsByProx(target, 1);
			for (const actor of hitActors) {
				console.log("HIT");
				actor.applyForce(vec2().setDirection(this._facingDirection, 5));
			}

			order.progress = "complete";
		}
	}
}
