import { vec2 } from "littlejsengine";
import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import { ChangeUnitVelocityMessage } from "../messages/change-unit-velocity-message";
import type { MessageBroker } from "../messages/message-broker";
import { Ability } from "./ability";
import { UnitFlagCheck } from "./unit-flag-check";

export class StopMovingAbility extends Ability {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _messageBroker: MessageBroker,
	) {
		super();
	}

	protected initializeAbility(): void {
		// check impacted flag
		this._checks.push(
			new UnitFlagCheck(
				this._actorDirectory,
				this.castingUnitActorId,
				"impacted",
				false,
			),
		);
	}

	protected get channelDuration(): number {
		return 0;
	}

	protected applyEffects(): void {
		const unitActor = this._actorDirectory.getActorById(
			this.castingUnitActorId,
			UnitActor,
		);

		this._messageBroker.publishMessage(
			new ChangeUnitVelocityMessage(
				vec2().setAngle(unitActor.facingAngle, 0),
				false,
			),
			{ actorType: UnitActor, actorIds: [this.castingUnitActorId] },
		);
	}
}
