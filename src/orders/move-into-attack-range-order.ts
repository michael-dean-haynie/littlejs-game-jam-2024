import type { AbilityStage } from "../abilities/ability";
import { MoveIntoAttackRangeAbility } from "../abilities/move-into-attack-range-ability";
import { UnitFlagCheck } from "../abilities/unit-flag-check";
import { UnitInRangeCheck } from "../abilities/unit-in-range-check";
import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import { WeaponActor } from "../actors/weapon-actor";
import type { MessageBroker } from "../messages/message-broker";
import { yeet } from "../utilities/utilities";
import { Order } from "./order";

export class MoveIntoAttackRangeOrder extends Order {
	constructor(
		actorDirectory: ActorDirectory,
		messageBroker: MessageBroker,
		private readonly _targetUnitActorId: string,
	) {
		super(actorDirectory, messageBroker);
	}
	protected initializeAbility(): void {
		this.ability = new MoveIntoAttackRangeAbility(
			this.actorDirectory,
			this.messageBroker,
			this._targetUnitActorId,
		);
	}

	protected handleAbilityProgress(abilityStage: AbilityStage): void {
		if (abilityStage === "check failed") {
			if (this.ability.failedCheck instanceof UnitFlagCheck) {
				this.ability.resetProgress(); // keep trying
			}
		}
		if (abilityStage === "complete") {
			const castingUnitActor =
				this.actorDirectory.getActor(this.unitActorId, UnitActor) ?? yeet();
			const weaponActor =
				this.actorDirectory.getActor(
					castingUnitActor.equippedWeaponActorId ??
						yeet("UNEXPECTED_NULLISH_VALUE"),
					WeaponActor,
				) ?? yeet();
			const check = new UnitInRangeCheck(
				this.actorDirectory,
				this.unitActorId,
				this._targetUnitActorId,
				weaponActor.weaponType.range,
			);
			if (!check.check()) {
				this.ability.resetProgress(); // do it again
			} else {
				this.stage = "complete";
			}
		}
	}
}
