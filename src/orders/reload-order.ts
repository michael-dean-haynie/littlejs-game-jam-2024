import type { AbilityStage } from "../abilities/ability";
import { AttackAbility } from "../abilities/attack-ability";
import { ReloadAbility } from "../abilities/reload-ability";
import { UnitHasWeaponEquippedCheck } from "../abilities/unit-has-weapon-equipped-check";
import { WeaponClipNotEmptyCheck } from "../abilities/weapon-clip-not-empty-check";
import { WeaponClipNotFullCheck } from "../abilities/weapon-clip-not-full-check";
import { WeaponNotReloadingCheck } from "../abilities/weapon-not-reloading-check";
import { WeaponOffCooldownCheck } from "../abilities/weapon-off-cooldown-check";
import { Order } from "./order";

export class ReloadOrder extends Order {
	protected handleAbilityProgress(abilityStage: AbilityStage): void {
		if (abilityStage === "check failed") {
			if (this.ability.failedCheck instanceof UnitHasWeaponEquippedCheck) {
				this.stage = "complete"; // nothing happens
			}
			if (this.ability.failedCheck instanceof WeaponOffCooldownCheck) {
				this.ability.resetProgress(); // keep trying
			}
			if (this.ability.failedCheck instanceof WeaponClipNotFullCheck) {
				this.stage = "complete"; // nothing happens
			}
			if (this.ability.failedCheck instanceof WeaponNotReloadingCheck) {
				this.stage = "complete"; // nothing happens
			}
		}
		if (abilityStage === "complete") {
			this.stage = "complete";
		}
	}

	protected initializeAbility(): void {
		this.ability = new ReloadAbility(this.actorDirectory, this.messageBroker);
	}
}
