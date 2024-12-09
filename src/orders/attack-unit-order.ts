import type { AbilityStage } from "../abilities/ability";
import { AttackUnitAbility } from "../abilities/attack-unit-ability";
import { UnitHasWeaponEquippedCheck } from "../abilities/unit-has-weapon-equipped-check";
import { UnitInRangeCheck } from "../abilities/unit-in-range-check";
import { WeaponOffCooldownCheck } from "../abilities/weapon-off-cooldown-check";
import type { ActorDirectory } from "../actors/actor-directory";
import type { MessageBroker } from "../messages/message-broker";
import { MoveIntoAttackRangeOrder } from "./move-into-attack-range-order";
import { Order } from "./order";

export class AttackUnitOrder extends Order {
	constructor(
		actorDirectory: ActorDirectory,
		messageBroker: MessageBroker,
		private readonly _targetUnitActorId: string,
	) {
		super(actorDirectory, messageBroker);
	}

	protected initializeAbility(): void {
		this.ability = new AttackUnitAbility(
			this.actorDirectory,
			this.messageBroker,
			this._targetUnitActorId,
		);
	}

	protected handleAbilityProgress(abilityStage: AbilityStage): void {
		if (abilityStage === "check failed") {
			if (this.ability.failedCheck instanceof UnitHasWeaponEquippedCheck) {
				console.warn("failed UnitHasWeaponEquippedCheck");
			}
			if (this.ability.failedCheck instanceof WeaponOffCooldownCheck) {
				this.ability.resetProgress(); // keep trying
			}
			if (this.ability.failedCheck instanceof UnitInRangeCheck) {
				this.childOrder = new MoveIntoAttackRangeOrder(
					this.actorDirectory,
					this.messageBroker,
					this._targetUnitActorId,
				);
				this.childOrder.unitActorId = this.unitActorId;
				this.stage = "waiting for child";
			}
		}
		if (abilityStage === "complete") {
			this.resetProgress(); // keep repeating forever?
		}
	}
}
