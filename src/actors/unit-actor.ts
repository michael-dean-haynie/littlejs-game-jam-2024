import {
	type EngineObject,
	type Vector2,
	debugRect,
	engineObjects,
	engineObjectsCallback,
	isOverlapping,
	vec2,
} from "littlejsengine";
import { v4 } from "uuid";
import { UnitEngineObject } from "../engine-objects/unit-engine-object";
import type { MessageBroker } from "../message-broker";
import type { CreateUnitMessage } from "../messages/create-unit-message";
import {
	ImpactUnitMessage,
	IsImpactUnitMessage,
} from "../messages/impact-unit-message";
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

export const UnitMovementTypes = ["none", "self propelled", "impact"] as const;
export type UnitMovementType = (typeof UnitMovementTypes)[number];

export function IsUnitMovemmentType(
	value: string | null,
): value is UnitMovementType {
	return UnitMovementTypes.includes(value as UnitMovementType);
}

export class UnitActor extends Actor {
	constructor(
		messageBroker: MessageBroker,
		createUnitActorMessage: CreateUnitMessage,
	) {
		super(messageBroker);

		// register message handlers
		this.handlers.set("ImpactUnitMessage", this.handleImpactUnitMessage);
		this.handlers.set("IssueOrderMessage", this.handleIssueOrderMessage);

		this.unitId = v4();
		this.unitType = createUnitActorMessage.unitType;
		this._orderQueue = [];
		this._facingDirection = 2;
		this.currentMovementType = "none";

		// create engineObject
		this._engineObject = new UnitEngineObject(
			this.messageBroker,
			this,
			createUnitActorMessage.position,
			vec2(this.unitType.size),
			undefined,
			undefined,
			this.unitType.color,
		);
		this._engineObject.mass = this.unitType.mass;
	}

	readonly unitId: string;
	readonly unitType: UnitType;
	currentMovementType: UnitMovementType;

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

	private handleImpactUnitMessage = (message: Message): void => {
		if (IsImpactUnitMessage(message)) {
			if (message.impactedUnitId === this.unitId) {
				this.currentMovementType = "impact";
				this._engineObject.applyForce(message.force);
			}
		}
	};

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
			if (
				this.currentMovementType !== "impact" ||
				this._engineObject.velocity.length() < 0.01
			) {
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
				this.currentMovementType = "self propelled";
				order.progress = "in progress";
			}
		}

		if (order instanceof StopMovingOrder) {
			this._engineObject.velocity = vec2(0, 0);
			this.currentMovementType = "none";
			order.progress = "complete";
		}

		if (order instanceof FollowUnitOrder) {
			if (
				this.currentMovementType !== "impact" ||
				this._engineObject.velocity.length() < 0.01
			) {
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
				this.currentMovementType = "self propelled";
				order.progress = "in progress";
			}
		}

		if (order instanceof AttackOrder) {
			const target = vec2()
				.setDirection(this._facingDirection, this.unitType.size)
				.add(this._engineObject.pos);

			debugRect(target, vec2(1, 1));

			const hitActors = this.messageBroker
				.getUnitActorsByProx(target, 1)
				.filter((actor) => actor.unitId !== this.unitId);
			for (const actor of hitActors) {
				this.messageBroker.publish(
					new ImpactUnitMessage({
						force: vec2().setDirection(this._facingDirection, 5),
						impactedUnitId: actor.unitId,
					}),
				);
			}

			order.progress = "complete";
		}
	}
}
