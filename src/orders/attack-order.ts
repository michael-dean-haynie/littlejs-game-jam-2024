import type { AbilityStage } from "../abilities/ability";
import { AttackAbility } from "../abilities/attack-ability";
import { UnitHasWeaponEquippedCheck } from "../abilities/unit-has-weapon-equipped-check";
import { WeaponClipNotEmptyCheck } from "../abilities/weapon-clip-not-empty-check";
import { WeaponOffCooldownCheck } from "../abilities/weapon-off-cooldown-check";
import { IssueOrderMessage } from "../messages/issue-order-message";
import { Order } from "./order";
import { ReloadOrder } from "./reload-order";

export class AttackOrder extends Order {
	protected handleAbilityProgress(abilityStage: AbilityStage): void {
		if (abilityStage === "check failed") {
			if (this.ability.failedCheck instanceof UnitHasWeaponEquippedCheck) {
				this.stage = "complete"; // nothing happens
			}
			if (this.ability.failedCheck instanceof WeaponOffCooldownCheck) {
				this.stage = "complete"; // nothing happens
			}
			if (this.ability.failedCheck instanceof WeaponClipNotEmptyCheck) {
				// let this complete (nothing happens) and auto-trigger reload
				this.stage = "complete";
				this.messageBroker.publishMessage(
					new IssueOrderMessage(
						new ReloadOrder(this.actorDirectory, this.messageBroker),
					),
					{ actorIds: [this.unitActorId] },
				);
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
