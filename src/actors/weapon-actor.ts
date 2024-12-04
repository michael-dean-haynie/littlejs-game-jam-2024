import { debugRect, vec2 } from "littlejsengine";
import type { MessageBroker } from "../message-broker";
import { IsFireWeaponMessage } from "../messages/fire-weapon-message";
import { ImpactUnitMessage } from "../messages/impact-unit-message";
import type { Message } from "../messages/message";
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
					const target = vec2()
						.setDirection(
							this.unitActor.facingDirection,
							this.unitActor.unitType.size,
						)
						.add(this.unitActor.pos);

					debugRect(target, vec2(1, 1));

					const hitActors = this.messageBroker
						.getUnitActorsByProx(target, 1)
						.filter((actor) => actor.unitId !== this.unitActor.unitId);
					for (const actor of hitActors) {
						this.messageBroker.publish(
							new ImpactUnitMessage({
								force: vec2().setDirection(this.unitActor.facingDirection, 5),
								impactedUnitId: actor.unitId,
							}),
						);
					}
				}
			}
		}
	};
}
