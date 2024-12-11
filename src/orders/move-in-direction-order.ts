import type { AbilityStage } from "../abilities/ability";
import { MoveInDirectionAbility } from "../abilities/move-in-direction-ability";
import { UnitFlagCheck } from "../abilities/unit-flag-check";
import type { Direction } from "../actors/input-actor";
import { FaceDirectionOrder } from "./face-direction-order";
import { Order } from "./order";

export class MoveInDirectionOrder extends Order {
	constructor(
		private readonly _direction: Direction,
		...params: ConstructorParameters<typeof Order>
	) {
		super(...params);
	}

	protected handleAbilityProgress(abilityStage: AbilityStage): void {
		if (abilityStage === "check failed") {
			if (this.ability.failedCheck instanceof UnitFlagCheck) {
				this.childOrder = new FaceDirectionOrder(
					this._direction,
					this.actorDirectory,
					this.messageBroker,
				);
				this.childOrder.unitActorId = this.unitActorId;
				this.stage = "waiting for child";
			}
		}
		if (abilityStage === "complete") {
			this.ability.resetProgress(); // do it again
		}
	}

	protected initializeAbility(): void {
		this.ability = new MoveInDirectionAbility(
			this.actorDirectory,
			this.messageBroker,
			this._direction,
		);
	}
}
