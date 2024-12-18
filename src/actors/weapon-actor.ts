import { clamp, debugLine, drawLine, vec2 } from "littlejsengine";
import type { GameScore } from "../game/game-score";
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
import { UnitTypes } from "../units/unit";
import { yeet } from "../utilities/utilities";
import {
	type WeaponType,
	WeaponTypes,
	weaponStatUpgradedValue,
} from "../weapons/weapon";
import { WeaponFlags } from "../weapons/weapon-flags";
import { Actor } from "./actor";
import { PlayerActor } from "./player-actor";
import { UnitActor } from "./unit-actor";

export class WeaponActor extends Actor {
	constructor(
		weaponType: WeaponType,
		unitActorId: string,
		private readonly _gameScore: GameScore,
		...params: ConstructorParameters<typeof Actor>
	) {
		super(...params);
		this.weaponType = weaponType;
		this._unitActorId = unitActorId;
		this._flags = new WeaponFlags();
		this._lastFire = 0;
		this._lastReload = 0;
		this._loadedRounds = this.calcClipSize(); // start with full clip
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
		return this.calcReloadMs() - this.reloadProgress;
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
			if (msSinceLastReload >= this.calcReloadMs()) {
				// add rounds to the clip
				this._loadedRounds = clamp(
					this._loadedRounds + this.weaponType.reloadRounds,
					0,
					this.calcClipSize(),
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
		this._loadedRounds = clamp(this._loadedRounds - 1, 0, this.calcClipSize());

		this.updateFlags();

		const unitActor =
			this.actorDirectory.getActor(this._unitActorId, UnitActor) ||
			yeet("UNEXPECTED_NULLISH_VALUE");
		const targetAngle = message.targetPos.subtract(unitActor.pos).angle();

		const intersectingRules: IntersectingRayRoutingRule[] = [];
		const aoeRays = this.calculateRayCount(this.weaponType);
		const templateRay = vec2()
			.setAngle(targetAngle, this.calcRange()) // start in direction of target
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
			new ImpactUnitMessage(this.calcForce(), unitActor.pos),
			routeRules,
		);
		// console.log(`${unitActor.unitType.name} dealt ${this.calcForce()} force.`);

		// damage
		this.messageBroker.publishMessage(
			new DamageUnitMessage(this._unitActorId, this.calcDamage(unitActor)),
			routeRules,
		);
		// console.log(
		// 	`${unitActor.unitType.name} dealt ${this.calcDamage()} damage.`,
		// );

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
		this._flags.reloading = msSinceLastReload <= this.calcReloadMs();

		this._flags.clipIsEmpty = this._loadedRounds <= 0;

		this._flags.clipIsFull = this._loadedRounds >= this.calcClipSize();
	}

	private stopReloading(): void {
		this._lastReload = 0;
		this.updateFlags();
	}

	private calculateRayCount(wt: WeaponType): number {
		const gap = 0.5; // minimum size of units for hit check
		const rayCount = Math.ceil(
			wt.spread / (2 * Math.asin(gap / (2 * this.calcRange()))),
		);
		return clamp(rayCount, 2, 100); // minimum of 2 rays to avoid divide by 0
	}

	calcDamage(unitActor?: UnitActor): number {
		const unitActr =
			unitActor ??
			this.actorDirectory.getActor(this._unitActorId, UnitActor) ??
			yeet();

		if (this.weaponType === WeaponTypes.animalMele) {
			return unitActr.unitType.mass;
		}

		return weaponStatUpgradedValue(
			this.weaponType.name,
			"damage",
			this._gameScore.weaponUpgrades[this.weaponType.name].damage,
		);
	}

	calcRange(unitActor?: UnitActor): number {
		const unitActr =
			unitActor ??
			this.actorDirectory.getActor(this._unitActorId, UnitActor) ??
			yeet();

		if (this.weaponType === WeaponTypes.animalMele) {
			// TODO: add a little extra more so big animals end up having range
			return unitActr.unitType.size * 0.75; // 1.4 diagonal / 2 (plus a little)
		}

		return weaponStatUpgradedValue(
			this.weaponType.name,
			"range",
			this._gameScore.weaponUpgrades[this.weaponType.name].range,
		);
	}

	calcForce(unitActor?: UnitActor): number {
		const unitActr =
			unitActor ??
			this.actorDirectory.getActor(this._unitActorId, UnitActor) ??
			yeet();

		if (this.weaponType === WeaponTypes.animalMele) {
			const relMoveSpeed =
				unitActr.unitType.moveSpeed / UnitTypes.prey.moveSpeed;
			return (unitActr.unitType.mass / 2) * (1 + relMoveSpeed);
		}

		return weaponStatUpgradedValue(
			this.weaponType.name,
			"force",
			this._gameScore.weaponUpgrades[this.weaponType.name].force,
		);
	}

	calcReloadMs(unitActor?: UnitActor): number {
		const unitActr =
			unitActor ??
			this.actorDirectory.getActor(this._unitActorId, UnitActor) ??
			yeet();

		if (this.weaponType === WeaponTypes.animalMele) {
			return this.weaponType.reloadMs;
		}

		return weaponStatUpgradedValue(
			this.weaponType.name,
			"reloadMs",
			this._gameScore.weaponUpgrades[this.weaponType.name].reloadMs,
		);
	}

	calcClipSize(unitActor?: UnitActor): number {
		const unitActr =
			unitActor ??
			this.actorDirectory.getActor(this._unitActorId, UnitActor) ??
			yeet();

		if (this.weaponType === WeaponTypes.animalMele) {
			return this.weaponType.clipSize;
		}

		return weaponStatUpgradedValue(
			this.weaponType.name,
			"clipSize",
			this._gameScore.weaponUpgrades[this.weaponType.name].clipSize,
		);
	}
}
