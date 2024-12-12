import { PI, type Vector2, clamp, vec2 } from "littlejsengine";
import { UnitEngineObject } from "../engine-objects/unit-engine-object";
import { AddWeaponToUnitMessage } from "../messages/add-weapon-to-unit-message";
import { ChangeUnitFacingAngleMessage } from "../messages/change-unit-facing-angle-message";
import { ChangeUnitVelocityMessage } from "../messages/change-unit-velocity-message";
import { CycleEquippedWeaponMessage } from "../messages/cycle-equipped-weapon-message";
import { ImpactUnitMessage } from "../messages/impact-unit-message";
import { IssueOrderMessage } from "../messages/issue-order-message";
import type { Message } from "../messages/message";
import { DamageUnitMessage } from "../messages/take-damage-message";
import { UnitHasDiedMessage } from "../messages/unit-has-died-message";
import { MoveInDirectionOrder } from "../orders/move-in-direction-order";
import type { Order } from "../orders/order";
import { StopMovingOrder } from "../orders/stop-moving-order";
import type { UnitType } from "../units/unit";
import { UnitFlags } from "../units/unit-flags";
import { yeet } from "../utilities/utilities";
import type { WeaponType } from "../weapons/weapon";
import { Actor } from "./actor";
import type { Team } from "./player-actor";
import { WeaponActor } from "./weapon-actor";

export class UnitActor extends Actor {
	constructor(
		unitType: UnitType,
		position: Vector2,
		team: Team,
		...params: ConstructorParameters<typeof Actor>
	) {
		super(...params);
		this.unitType = unitType;
		this.team = team;
		this._flags = new UnitFlags();
		this._weaponActorIds = [];
		this._equippedWeaponActorId = null;
		this._hitpoints = this.unitType.hitpoints;
		this._facingAngle = PI; // down
		this._deathMessage = null;

		// add default weapons (skip message broker for immediate init)
		for (const weaponType of this.unitType.defaultWeapons) {
			this.addWeaponActor(weaponType);
		}

		// create engine object
		this._engineObject = new UnitEngineObject(
			this.actorDirectory,
			this.messageBroker,
			this,
			position,
			vec2(this.unitType.size),
			undefined,
			undefined,
			this.unitType.color,
		);
		this._engineObject.mass = this.unitType.mass;

		this._orderQueue = [];
	}

	readonly unitType: UnitType;
	readonly team: Team;

	private _deathMessage: UnitHasDiedMessage | null;

	private _facingAngle: number; // in radians
	get facingAngle(): number {
		return this._facingAngle;
	}

	private _flags: UnitFlags;
	get flags(): Readonly<UnitFlags> {
		return this._flags;
	}

	private _weaponActorIds: string[];
	get weaponActorIds(): ReadonlyArray<string> {
		return this._weaponActorIds;
	}

	private _equippedWeaponActorId: string | null;
	get equippedWeaponActorId(): string | null {
		return this._equippedWeaponActorId;
	}

	private _hitpoints: number;
	get hitpoints(): number {
		return this._hitpoints;
	}

	private readonly _engineObject: UnitEngineObject;
	get pos(): Vector2 {
		return this._engineObject.pos;
	}
	get size(): Vector2 {
		return this._engineObject.size;
	}
	get velocity(): Vector2 {
		return this._engineObject.velocity;
	}

	private readonly _orderQueue: Order[];

	destroy(): void {
		// destroy weapon actors
		for (const weaponActorId of this._weaponActorIds) {
			const weaponActor =
				this.actorDirectory.getActor(weaponActorId, WeaponActor) ?? yeet();
			weaponActor.destroy();
		}

		// destroy engine object
		this._engineObject.destroy();

		super.destroy();
	}

	update(): void {
		// un-impact self after coming close enough to a halt
		if (this.flags.impacted && this.velocity.length() < 0.01) {
			this._flags.impacted = false;
		}

		// check if ready to die
		if (this.flags.dying && !this.flags.impacted) {
			this.die();
		}

		super.update(); // handles incomming messages

		// process order queue
		if (this._orderQueue.length && !this.destroyed) {
			// try to execute order
			const order = this._orderQueue[0];
			order.tryToProgress();

			// if it completed, remove it from the queue
			if (order.stage === "complete") {
				this._orderQueue.shift();
			}
		}
	}

	protected handleMessage<T extends Message>(message: T): void {
		if (message instanceof AddWeaponToUnitMessage) {
			this.handleAddWeaponToUnitMessage(message);
		}
		if (message instanceof ImpactUnitMessage) {
			this.handleImpactUnitMessage(message);
		}
		if (message instanceof DamageUnitMessage) {
			this.handleDamageUnitMessage(message);
		}
		if (message instanceof ChangeUnitVelocityMessage) {
			this.handleChangeUnitVelocityMessage(message);
		}
		if (message instanceof ChangeUnitFacingAngleMessage) {
			this.handleChangeUnitFacingAngleMessage(message);
		}
		if (message instanceof CycleEquippedWeaponMessage) {
			this.handleCycleEquippedWeaponMessage(message);
		}
		if (message instanceof IssueOrderMessage) {
			this.handleIssueOrderMessage(message);
		}
	}

	private handleAddWeaponToUnitMessage(message: AddWeaponToUnitMessage): void {
		this.addWeaponActor(message.weaponType);
	}

	private handleImpactUnitMessage(message: ImpactUnitMessage): void {
		this._flags.impacted = true;
		if (message.force > 0) {
			this._engineObject.applyForce(
				this.pos.subtract(message.originPoint).normalize(message.force),
			);
		}
	}

	private handleDamageUnitMessage(message: DamageUnitMessage): void {
		this._hitpoints = clamp(
			this._hitpoints - message.damage,
			0,
			this.unitType.hitpoints,
		);
		if (this.hitpoints <= 0) {
			this._flags.dying = true;
			const killingUnitActor =
				this.actorDirectory.getActor<UnitActor>(
					message.damagingUnitActorId,
					UnitActor,
				) || yeet("UNEXPECTED_NULLISH_VALUE");

			this._deathMessage = new UnitHasDiedMessage(
				this.actorId,
				this.unitType,
				this.team,
				killingUnitActor.actorId,
				killingUnitActor.unitType,
				killingUnitActor.team,
			);
		}
	}

	private handleChangeUnitVelocityMessage(
		message: ChangeUnitVelocityMessage,
	): void {
		this._engineObject.velocity = message.velocity;
		if (message.updateFacingAngle && message.velocity.length() > 0) {
			this._facingAngle = message.velocity.angle();
		}
	}

	private handleChangeUnitFacingAngleMessage(
		message: ChangeUnitFacingAngleMessage,
	): void {
		this._facingAngle = message.angle;
	}

	private handleCycleEquippedWeaponMessage(
		message: CycleEquippedWeaponMessage,
	): void {
		const current = this._weaponActorIds.shift();
		if (current) {
			this._weaponActorIds.push(current);
			this.equipWeaponActor(this.weaponActorIds[0]);
		}
	}

	private handleIssueOrderMessage(message: IssueOrderMessage): void {
		message.order.unitActorId = this.actorId;

		// replace conflicting orders
		if (
			message.order instanceof MoveInDirectionOrder ||
			message.order instanceof StopMovingOrder
		) {
			if (
				this._orderQueue[0] instanceof MoveInDirectionOrder ||
				this._orderQueue[0] instanceof StopMovingOrder
			) {
				this._orderQueue.shift(); // remove first existing order
			}
		}

		// reset progress for any orders that got delayed
		for (const order of this._orderQueue) {
			order.resetProgress();
		}
		this._orderQueue.unshift(message.order);
	}

	private die() {
		this.messageBroker.publishMessage(this._deathMessage ?? yeet(), {
			actorIds: [
				this.actorDirectory.getActorIdByAlias("playerActor") ?? yeet(),
				this.actorDirectory.getActorIdByAlias("enemyActor") ?? yeet(),
			],
		});

		this.destroy();
	}

	private addWeaponActor(weaponType: WeaponType): void {
		const weaponActor = new WeaponActor(
			weaponType,
			this.actorId,
			this.actorDirectory,
			this.messageBroker,
		);
		this._weaponActorIds.push(weaponActor.actorId);

		// equip if there's no weapon already equipped
		if (this.equippedWeaponActorId === null) {
			this.equipWeaponActor(weaponActor.actorId);
		}
	}

	private equipWeaponActor(weaponActorId: string): void {
		this._equippedWeaponActorId = weaponActorId;
	}
}
