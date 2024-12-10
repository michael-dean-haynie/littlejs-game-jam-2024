import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import { WeaponActor } from "../actors/weapon-actor";
import { FireWeaponMessage } from "../messages/fire-weapon-message";
import type { MessageBroker } from "../messages/message-broker";
import { yeet } from "../utilities/utilities";
import { Ability } from "./ability";
import { UnitHasWeaponEquippedCheck } from "./unit-has-weapon-equipped-check";
import { WeaponOffCooldownCheck } from "./weapon-off-cooldown-check";

export class AttackAbility extends Ability {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _messageBroker: MessageBroker,
		...params: ConstructorParameters<typeof Ability>
	) {
		super(...params);
	}

	protected initializeAbility(): void {
		const castingUnitActor = this._actorDirectory.getActor(
			this.castingUnitActorId,
			UnitActor,
		);

		this._checks.push(
			new UnitHasWeaponEquippedCheck(
				this._actorDirectory,
				this.castingUnitActorId,
			),
		);

		const weaponActor = this._actorDirectory.getActor(
			castingUnitActor.equippedWeaponActorId ??
				yeet("UNEXPECTED_NULLISH_VALUE"), // should be validated to exist by previous check
			WeaponActor,
		);

		this._checks.push(
			new WeaponOffCooldownCheck(this._actorDirectory, weaponActor.actorId),
		);
	}

	protected get channelDuration(): number {
		return 0;
	}

	protected applyEffects(): void {
		const castingUnitActor = this._actorDirectory.getActor(
			this.castingUnitActorId,
			UnitActor,
		);
		this._messageBroker.publishMessage(new FireWeaponMessage(), {
			actorIds: [
				castingUnitActor.equippedWeaponActorId ??
					yeet("UNEXPECTED_NULLISH_VALUE"),
			],
		});
	}
}
