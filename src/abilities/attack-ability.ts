import type { Vector2 } from "littlejsengine";
import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import { WeaponActor } from "../actors/weapon-actor";
import { FireWeaponMessage } from "../messages/fire-weapon-message";
import type { MessageBroker } from "../messages/message-broker";
import { yeet } from "../utilities/utilities";
import { Ability } from "./ability";
import { UnitHasWeaponEquippedCheck } from "./unit-has-weapon-equipped-check";
import { WeaponClipNotEmptyCheck } from "./weapon-clip-not-empty-check";
import { WeaponOffCooldownCheck } from "./weapon-off-cooldown-check";

export class AttackAbility extends Ability {
	constructor(
		private readonly _targetPos: Vector2,
		private readonly _actorDirectory: ActorDirectory,
		private readonly _messageBroker: MessageBroker,
		...params: ConstructorParameters<typeof Ability>
	) {
		super(...params);
	}

	protected initializeAbility(): void {
		const castingUnitActor =
			this._actorDirectory.getActor(this.castingUnitActorId, UnitActor) ??
			yeet();

		this._checks.push(
			new UnitHasWeaponEquippedCheck(
				this._actorDirectory,
				this.castingUnitActorId,
			),
		);

		if (castingUnitActor.equippedWeaponActorId) {
			const weaponActor =
				this._actorDirectory.getActor(
					castingUnitActor.equippedWeaponActorId, // should be validated to exist by previous check
					WeaponActor,
				) ?? yeet();

			this._checks.push(
				new WeaponOffCooldownCheck(this._actorDirectory, weaponActor.actorId),
			);

			this._checks.push(
				new WeaponClipNotEmptyCheck(this._actorDirectory, weaponActor.actorId),
			);
		}
	}

	protected get channelDuration(): number {
		return 0;
	}

	protected applyEffects(): void {
		const castingUnitActor =
			this._actorDirectory.getActor(this.castingUnitActorId, UnitActor) ??
			yeet();
		this._messageBroker.publishMessage(new FireWeaponMessage(this._targetPos), {
			actorIds: [castingUnitActor.equippedWeaponActorId ?? yeet()],
		});
	}
}
