import { debugRect, vec2 } from "littlejsengine";
import type { MessageBroker } from "../message-broker";
import { IsFireWeaponMessage } from "../messages/fire-weapon-message";
import { ImpactUnitMessage } from "../messages/impact-unit-message";
import type { Message } from "../messages/message";
import { DamageUnitMessage } from "../messages/take-damage-message";
import type { WeaponType } from "../weapons/weapon";
import { Actor } from "./actor";
import type { UnitActor } from "./unit-actor";

export class WeaponActor extends Actor {
	constructor(
		public readonly weaponType: WeaponType,
		public readonly unitActor: UnitActor,
		protected readonly messageBroker: MessageBroker,
	) {
		super(messageBroker);

		// register message handlers
		this.handlers.set("FireWeaponMessage", this.handleFireWeaponMessage);
	}

	private handleFireWeaponMessage = (message: Message): void => {
		if (IsFireWeaponMessage(message)) {
			if (message.firingUnitId === this.unitActor.unitId) {
				if (this.unitActor.equippedWeaponActor === this) {
					// find hit units
					const target = vec2()
						.setAngle(this.unitActor.facingAngle, this.unitActor.unitType.size)
						.add(this.unitActor.pos);

					debugRect(target, vec2(1, 1));

					const hitActors = this.messageBroker
						.getUnitActorsByProx(target, 1)
						.filter((actor) => actor.unitId !== this.unitActor.unitId);
					for (const actor of hitActors) {
						// impace
						this.messageBroker.publish(
							new ImpactUnitMessage({
								force: vec2().setAngle(this.unitActor.facingAngle, 5),
								impactedUnitId: actor.unitId,
							}),
						);

						// damage
						this.messageBroker.publish(
							new DamageUnitMessage({
								damage: this.weaponType.damage,
								damagedUnitId: actor.unitId,
								damagingUnitId: message.firingUnitId,
							}),
						);
					}
				}
			}
		}
	};
}
