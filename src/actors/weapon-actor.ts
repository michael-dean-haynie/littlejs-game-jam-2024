import { clamp, debugLine, vec2 } from "littlejsengine";
import { FireWeaponMessage } from "../messages/fire-weapon-message";
import { ImpactUnitMessage } from "../messages/impact-unit-message";
import type { Message } from "../messages/message";
import type {
	IntersectingRayRoutingRule,
	MessageRoutingRules,
} from "../messages/message-routing-rules";
import { PlayerFiredWeaponMessage } from "../messages/player-fired-weapon-message";
import { ReloadWeaponMessage } from "../messages/reload-weapon-message";
import { DamageUnitMessage } from "../messages/take-damage-message";
import { WeaponEquippedMessage } from "../messages/weapon-equipped-message";
import { WeaponUnequippedMessage } from "../messages/weapon-unequipped-message";
import { yeet } from "../utilities/utilities";
import type { WeaponType } from "../weapons/weapon";
import { WeaponFlags } from "../weapons/weapon-flags";
import { Actor } from "./actor";
import { PlayerActor } from "./player-actor";
import { UnitActor } from "./unit-actor";

export class WeaponActor extends Actor {
	constructor(
		weaponType: WeaponType,
		unitActorId: string,
		...params: ConstructorParameters<typeof Actor>
	) {
		super(...params);
		this.weaponType = weaponType;
		this._unitActorId = unitActorId;
		this._flags = new WeaponFlags();
		this._lastFire = 0;
		this._lastReload = 0;
		this._loadedRounds = weaponType.clipSize; // start with full clip
	}

	readonly weaponType: WeaponType;
	private readonly _unitActorId: string;

	private _flags: WeaponFlags;
	get flags(): Readonly<WeaponFlags> {
		return this._flags;
	}

	/** timestamp of last time this weapon fired */
	private _lastFire: number;

	/** timestamp of last time this weapon started reloading */
	private _lastReload: number;
	get reloadProgress(): number {
		return Date.now() - this._lastReload;
	}
	get reloadRemaining(): number {
		return this.weaponType.reloadMs - this.reloadProgress;
	}

	/** number of rounds currently in the clip */
	private _loadedRounds: number;
	get loadedRounds(): number {
		return this._loadedRounds;
	}

	update(): void {
		// check if reload cycle is finished
		if (this.flags.reloading) {
			const msSinceLastReload = Date.now() - this._lastReload;
			if (msSinceLastReload >= this.weaponType.reloadMs) {
				// add rounds to the clip
				this._loadedRounds = clamp(
					this._loadedRounds + this.weaponType.reloadRounds,
					0,
					this.weaponType.clipSize,
				);
			}
		}

		this.updateFlags();
		super.update();
	}

	protected handleMessage<T extends Message>(message: T): void {
		if (message instanceof FireWeaponMessage) {
			this.handleFireWeaponMessage(message);
		}
		if (message instanceof ReloadWeaponMessage) {
			this.handleReloadWeaponMessage(message);
		}
		if (message instanceof WeaponEquippedMessage) {
			this.handleWeaponEquippedMessage(message);
		}
		if (message instanceof WeaponUnequippedMessage) {
			this.handleWeaponUnequippedMessage(message);
		}
	}

	private handleFireWeaponMessage(message: FireWeaponMessage): void {
		if (this.flags.clipIsEmpty) {
			throw new Error("clip was empty, check should have failed before now");
		}

		if (this.flags.onCooldown) {
			throw new Error(
				"weapon was on cooldown, check should have failed before now",
			);
		}

		// cancel reloading (if currently reloading)
		if (this.flags.reloading) {
			this._lastReload = 0;
		}

		// update the last fire timestamp
		this._lastFire = Date.now();

		// remove a round from the clip
		this._loadedRounds = clamp(
			this._loadedRounds - 1,
			0,
			this.weaponType.clipSize,
		);

		this.updateFlags();

		const unitActor =
			this.actorDirectory.getActor(this._unitActorId, UnitActor) ||
			yeet("UNEXPECTED_NULLISH_VALUE");
		const targetAngle = message.targetPos.subtract(unitActor.pos).angle();

		const intersectingRules: IntersectingRayRoutingRule[] = [];
		const aoeRays = this.calculateRayCount(this.weaponType);
		const templateRay = vec2()
			.setAngle(targetAngle, this.weaponType.range) // start in direction of target
			.rotate(-1 * (this.weaponType.spread / 2)); // adjust backward by half the spread angle for the first ray
		const incrementAngle = this.weaponType.spread / (aoeRays - 1);
		for (let rayNo = 0; rayNo < aoeRays; rayNo++) {
			// TODO: maybe make it start at edge of unit size
			intersectingRules.push({
				start: unitActor.pos,
				end: unitActor.pos.add(templateRay.rotate(incrementAngle * rayNo)),
			});
		}

		const routeRules: MessageRoutingRules = {
			intersecting: intersectingRules,
			excludeActorIds: [this._unitActorId],
		};

		// TEMP: use real particles
		for (const line of intersectingRules) {
			debugLine(line.start, line.end, undefined, undefined, 0.1);
		}

		// Sound Effect
		this.weaponType.sound.play(undefined, this.weaponType.soundVolume);

		// impact (before dmg so unit can become impacted before dying)
		this.messageBroker.publishMessage(
			new ImpactUnitMessage(this.weaponType.force, unitActor.pos),
			routeRules,
		);

		// damage
		this.messageBroker.publishMessage(
			new DamageUnitMessage(this._unitActorId, this.weaponType.damage),
			routeRules,
		);

		// update score
		if (unitActor.team === "player") {
			const playerActorId =
				this.actorDirectory.getActorIdByAlias("playerActor") ?? yeet();
			this.messageBroker.publishMessage(
				new PlayerFiredWeaponMessage(this.weaponType.name),
				{ actorIds: [playerActorId] },
			);
		}

		// auto-start reload if clip is empty
		if (this.flags.clipIsEmpty) {
			this.handleReloadWeaponMessage(new ReloadWeaponMessage()); // message self
		}
	}

	private handleReloadWeaponMessage(message: ReloadWeaponMessage): void {
		this._lastReload = Date.now();
		this.updateFlags();
	}

	private handleWeaponEquippedMessage(message: WeaponEquippedMessage): void {
		if (this.flags.clipIsEmpty) {
			this.handleReloadWeaponMessage(new ReloadWeaponMessage()); // message self?
		}
	}

	private handleWeaponUnequippedMessage(
		message: WeaponUnequippedMessage,
	): void {
		if (this.flags.reloading) {
			this.stopReloading();
		}
	}

	private updateFlags(): void {
		const msSinceLastFire = Date.now() - this._lastFire;
		this._flags.onCooldown = msSinceLastFire <= this.weaponType.cooldownMs;

		const msSinceLastReload = Date.now() - this._lastReload;
		this._flags.reloading = msSinceLastReload <= this.weaponType.reloadMs;

		this._flags.clipIsEmpty = this._loadedRounds <= 0;

		this._flags.clipIsFull = this._loadedRounds >= this.weaponType.clipSize;
	}

	private stopReloading(): void {
		this._lastReload = 0;
		this.updateFlags();
	}

	private calculateRayCount(wt: WeaponType): number {
		const gap = 0.5; // minimum size of units for hit check
		const rayCount = Math.ceil(
			wt.spread / (2 * Math.asin(gap / (2 * wt.range))),
		);
		return clamp(rayCount, 2, 100); // minimum of 2 rays to avoid divide by 0
	}
}
