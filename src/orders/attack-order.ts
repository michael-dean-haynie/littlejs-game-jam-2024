import type { AbilityStage } from "../abilities/ability";
import { AttackAbility } from "../abilities/attack-ability";
import { UnitHasWeaponEquippedCheck } from "../abilities/unit-has-weapon-equipped-check";
import { WeaponOffCooldownCheck } from "../abilities/weapon-off-cooldown-check";
import { Order } from "./order";

export class AttackOrder extends Order {
	protected handleAbilityProgress(abilityStage: AbilityStage): void {
		if (abilityStage === "check failed") {
			if (this.ability.failedCheck instanceof UnitHasWeaponEquippedCheck) {
				this.stage = "complete"; // nothing happens
			}
			if (this.ability.failedCheck instanceof WeaponOffCooldownCheck) {
				this.stage = "complete"; // nothing happens
			}
		}
		if (abilityStage === "complete") {
			this.stage = "complete";
		}
	}

	protected initializeAbility(): void {
		this.ability = new AttackAbility(this.actorDirectory, this.messageBroker);
	}
}
