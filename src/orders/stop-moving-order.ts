import type { AbilityStage } from "../abilities/ability";
import { StopMovingAbility } from "../abilities/stop-moving-ability";
import { Order } from "./order";

export class StopMovingOrder extends Order {
	protected initializeAbility(): void {
		this.ability = new StopMovingAbility(
			this.actorDirectory,
			this.messageBroker,
		);
	}

	protected handleAbilityProgress(abilityStage: AbilityStage): void {
		if (abilityStage === "complete") {
			this.stage = "complete";
		}
	}
}
