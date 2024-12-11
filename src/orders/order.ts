import type { Ability, AbilityStage } from "../abilities/ability";
import type { ActorDirectory } from "../actors/actor-directory";
import type { MessageBroker } from "../messages/message-broker";
import { yeet } from "../utilities/utilities";
import { AttackUnitOrder } from "./attack-unit-order";

/** Orders handle the control flow and composition of smaller abilities */
export abstract class Order {
	constructor(
		protected readonly actorDirectory: ActorDirectory,
		protected readonly messageBroker: MessageBroker,
	) {
		this._stage = "init";
		this._childOrder = null;
		this._unitActorId = null; // to be assigned by unit while being processed
		this._ability = null; // to be initialized after _unitActorId is provided
	}

	private _ability: Ability | null;
	protected get ability(): Ability {
		return this._ability ?? yeet("UNEXPECTED_NULLISH_VALUE");
	}
	protected set ability(value: Ability) {
		this._ability = value;
	}

	private _stage: OrderStage;
	get stage(): OrderStage {
		return this._stage;
	}
	protected set stage(value: OrderStage) {
		this._stage = value;
	}

	private _unitActorId: string | null;
	get unitActorId(): string {
		return this._unitActorId ?? yeet("UNEXPECTED_NULLISH_VALUE");
	}
	set unitActorId(value: string) {
		this._unitActorId = value;
		this.initializeAbility();
		this.ability.castingUnitActorId = this.unitActorId;
	}

	private _childOrder: Order | null;
	protected get childOrder(): Order | null {
		return this._childOrder;
	}
	protected set childOrder(value: Order) {
		this._childOrder = value;
	}

	tryToProgress(): OrderStage {
		// init
		if (this.stage === "init") {
			this._stage = "in progress";
		}

		// in progress
		if (this.stage === "in progress") {
			const abilityStage = this.ability.tryToProgress();
			this.handleAbilityProgress(abilityStage);
		}

		// waiting for child
		if (this.stage === "waiting for child") {
			const childOrderStage = this.childOrder?.tryToProgress();
			if (childOrderStage === "complete") {
				this.ability.resetProgress();
				this._stage = "in progress";
			}
		}

		// complete
		if (this.stage === "complete") {
			// do nothing?
		}

		return this.stage;
	}

	resetProgress(): void {
		this.ability.resetProgress();
		this._childOrder = null;
		this._stage = "init";
	}

	protected abstract handleAbilityProgress(abilityStage: AbilityStage): void;

	protected abstract initializeAbility(): void;
}

export const OrderStages = [
	/** nothing has happened yet */
	"init",
	"in progress",
	/** control flow passed to child order */
	"waiting for child",
	"complete",
] as const;
export type OrderStage = (typeof OrderStages)[number];

export function IsActorDirectoryAlias(
	value: string | null,
): value is OrderStage {
	return OrderStages.includes(value as OrderStage);
}
