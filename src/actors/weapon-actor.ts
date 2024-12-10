import { type Vector2, clamp, debugLine, vec2 } from "littlejsengine";
import { FireWeaponMessage } from "../messages/fire-weapon-message";
import { ImpactUnitMessage } from "../messages/impact-unit-message";
import type { Message } from "../messages/message";
import type {
	IntersectingRayRoutingRule,
	MessageRoutingRules,
} from "../messages/message-routing-rules";
import { DamageUnitMessage } from "../messages/take-damage-message";
import { yeet } from "../utilities/utilities";
import type { WeaponType } from "../weapons/weapon";
import { Actor } from "./actor";
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
		this._weaponCooldownStart = null;
	}

	readonly weaponType: WeaponType;

	private readonly _unitActorId: string;

	private _weaponCooldownStart: number | null;
	get cooldownRemaining(): number {
		if (this._weaponCooldownStart === null) {
			return 0;
		}

		const msSinceLastFire = Date.now() - this._weaponCooldownStart;
		if (msSinceLastFire > this.weaponType.cooldown) {
			return 0;
		}

		return this.weaponType.cooldown - msSinceLastFire;
	}
	get offCooldown(): boolean {
		return this.cooldownRemaining <= 0;
	}

	protected handleMessage<T extends Message>(message: T): void {
		if (message instanceof FireWeaponMessage) {
			this.handleFireWeaponMessage(message);
		}
	}

	private handleFireWeaponMessage(message: FireWeaponMessage): void {
		// update cooldown
		this._weaponCooldownStart = Date.now();

		const unitActor =
			this.actorDirectory.getActor(this._unitActorId, UnitActor) ||
			yeet("UNEXPECTED_NULLISH_VALUE");

		const intersectingRules: IntersectingRayRoutingRule[] = [];
		const aoeRays = this.calculateRayCount(this.weaponType);
		const templateRay = vec2()
			.setAngle(unitActor.facingAngle, this.weaponType.range) // start in direction unit is facing
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

		// damage
		this.messageBroker.publishMessage(
			new DamageUnitMessage(this._unitActorId, this.weaponType.damage),
			routeRules,
		);

		// impact
		this.messageBroker.publishMessage(
			new ImpactUnitMessage(
				vec2().setAngle(unitActor.facingAngle, this.weaponType.force),
			),
			routeRules,
		);
	}

	private calculateRayCount(wt: WeaponType): number {
		const gap = 0.5; // minimum size of units for hit check
		const rayCount = Math.ceil(
			wt.spread / (2 * Math.asin(gap / (2 * wt.range))),
		);
		return clamp(rayCount, 2, 100); // minimum of 2 rays to avoid divide by 0
	}
}
