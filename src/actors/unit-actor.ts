import {
	type EngineObject,
	type Vector2,
	isOverlapping,
	vec2,
} from "littlejsengine";
import { v4 } from "uuid";
import { UnitEngineObject } from "../engine-objects/unit-engine-object";
import type { MessageBroker } from "../message-broker";
import {
	AddWeaponToUnitMessage,
	IsAddWeaponToUnitMessage,
} from "../messages/add-weapon-to-unit-message";
import type { CreateUnitMessage, Team } from "../messages/create-unit-message";
import { FireWeaponMessage } from "../messages/fire-weapon-message";
import { IsImpactUnitMessage } from "../messages/impact-unit-message";
import {
	IsIssueOrderMessage,
	IssueOrderMessage,
} from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { DamageUnitMessage } from "../messages/take-damage-message";
import { UnitHasDiedMessage } from "../messages/unit-has-died-message";
import { AttackInDirectionOrder } from "../orders/attack-order";
import { EquipWeaponOrder } from "../orders/equip-weapon-order";
import { FollowUnitOrder } from "../orders/follow-unit-order";
import { MoveInDirectionOrder } from "../orders/move-in-direction-order";
import type { Order } from "../orders/order";
import { StopMovingOrder } from "../orders/stop-moving-order";
import type { UnitType } from "../units/unit";
import { Actor } from "./actor";
import { WeaponActor } from "./weapon-actor";

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
		this.handlers.set(
			"AddWeaponToUnitMessage",
			this.handleAddWeaponToUnitMessage,
		);
		this.handlers.set("ImpactUnitMessage", this.handleImpactUnitMessage);
		this.handlers.set("DamageUnitMessage", this.handleDamageUnitMessage);
		this.handlers.set("IssueOrderMessage", this.handleIssueOrderMessage);

		this.unitId = v4();
		this.unitType = createUnitActorMessage.unitType;
		this.team = createUnitActorMessage.team;
		this._orderQueue = [];
		this.facingDirection = 2;
		this.currentMovementType = "none";
		this.weaponActors = [];
		this.hitpoints = this.unitType.hitpoints;

		// add default weapons
		for (const weaponType of this.unitType.defaultWeapons) {
			this.messageBroker.publish(
				new AddWeaponToUnitMessage({
					weaponType: weaponType,
					unitId: this.unitId,
				}),
			);
		}

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
	readonly team: Team;
	currentMovementType: UnitMovementType;
	weaponActors: WeaponActor[];
	equippedWeaponActor?: WeaponActor;
	facingDirection: number;
	hitpoints: number;

	private _engineObject: EngineObject;
	private _orderQueue: Order[];

	get pos(): Vector2 {
		return this._engineObject.pos;
	}

	destroy(): void {
		super.destroy();
		this._engineObject.destroy();
		for (const weaponActor of this.weaponActors) {
			weaponActor.destroy();
		}
	}

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

	private handleAddWeaponToUnitMessage = (message: Message): void => {
		if (IsAddWeaponToUnitMessage(message)) {
			if (message.unitId === this.unitId) {
				this.weaponActors.push(
					new WeaponActor(message.weaponType, this, this.messageBroker),
				);
				if (!this.equippedWeaponActor) {
					this.messageBroker.publish(
						new IssueOrderMessage({
							order: new EquipWeaponOrder({
								weaponType: message.weaponType,
							}),
							orderedUnitId: this.unitId,
						}),
					);
				}
			}
		}
	};

	private handleImpactUnitMessage = (message: Message): void => {
		if (IsImpactUnitMessage(message)) {
			if (message.impactedUnitId === this.unitId) {
				this.currentMovementType = "impact";
				this._engineObject.applyForce(message.force);
			}
		}
	};

	private handleDamageUnitMessage = (message: Message): void => {
		if (message instanceof DamageUnitMessage) {
			if (message.damagedUnitId === this.unitId) {
				this.hitpoints -= message.damage;
				if (this.hitpoints <= 0) {
					const killingUnitActor = this.messageBroker.getUnitActorById(
						message.damagingUnitId,
					);
					this.messageBroker.publish(
						new UnitHasDiedMessage({
							deadUnitId: this.unitId,
							deadUnitType: this.unitType,
							deadUnitTeam: this.team,
							killingUnitId: killingUnitActor.unitId,
							killingUnitType: killingUnitActor.unitType,
							killingUnitTeam: killingUnitActor.team,
						}),
					);
				}
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

				if (message.order instanceof AttackInDirectionOrder) {
					this._orderQueue.unshift(message.order);
				}

				if (message.order instanceof EquipWeaponOrder) {
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
				this.facingDirection = this._engineObject.velocity.direction();
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

				this.facingDirection = this._engineObject.velocity.direction();
				this.currentMovementType = "self propelled";
				order.progress = "in progress";
			}
		}

		if (order instanceof EquipWeaponOrder) {
			this.equippedWeaponActor = this.weaponActors.find(
				(wa) => wa.weaponType === order.weaponType,
			);
			order.progress = "complete";
		}

		if (order instanceof AttackInDirectionOrder) {
			if (this.equippedWeaponActor) {
				this.messageBroker.publish(
					new FireWeaponMessage({
						firingUnitId: this.unitId,
					}),
				);
			} else {
				throw new Error("no weapon is equipped");
			}

			order.progress = "complete";
		}
	}
}
