import type { AbilityStage } from "../abilities/ability";
import { FaceDirectionAbility } from "../abilities/face-direction-ability";
import type { Direction } from "../actors/input-actor";
import { Order } from "./order";

export class FaceDirectionOrder extends Order {
	constructor(
		private readonly _direction: Direction,
		...params: ConstructorParameters<typeof Order>
	) {
		super(...params);
	}

	protected handleAbilityProgress(abilityStage: AbilityStage): void {
		// not sure how this could fail
		// if (abilityStage === "check failed") {
		// 	if (this.ability.failedCheck instanceof UnitFlagCheck) {
		// 	}
		// }
		if (abilityStage === "complete") {
			this.stage = "complete";
		}
	}

	protected initializeAbility(): void {
		this.ability = new FaceDirectionAbility(
			this.actorDirectory,
			this.messageBroker,
			this._direction,
		);
	}
}
