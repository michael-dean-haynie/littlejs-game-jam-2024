import { type Vector2, vec2 } from "littlejsengine";
import type { ActorDirectory } from "../actors/actor-directory";
import type { Direction } from "../actors/input-actor";
import { UnitActor } from "../actors/unit-actor";
import { ChangeUnitFacingAngleMessage } from "../messages/change-unit-facing-angle-message";
import { ChangeUnitVelocityMessage } from "../messages/change-unit-velocity-message";
import type { MessageBroker } from "../messages/message-broker";
import { Ability } from "./ability";
import { UnitFlagCheck } from "./unit-flag-check";

export class FaceDirectionAbility extends Ability {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _messageBroker: MessageBroker,
		private readonly _direction: Direction,
		...params: ConstructorParameters<typeof Ability>
	) {
		super(...params);
	}

	protected initializeAbility(): void {}

	protected applyEffects(): void {
		const unitActor = this._actorDirectory.getActor(
			this.castingUnitActorId,
			UnitActor,
		);

		const ms = unitActor.unitType.moveSpeed;
		let angle = 0; // will be overwritten

		if (this._direction === "up") {
			angle = vec2(0, 1).angle();
		}
		if (this._direction === "left") {
			angle = vec2(-1, 0).angle();
		}
		if (this._direction === "down") {
			angle = vec2(0, -1).angle();
		}
		if (this._direction === "right") {
			angle = vec2(1, 0).angle();
		}
		if (this._direction === "up left") {
			angle = vec2(-1, 1).angle();
		}
		if (this._direction === "down left") {
			angle = vec2(-1, -1).angle();
		}
		if (this._direction === "up right") {
			angle = vec2(1, 1).angle();
		}
		if (this._direction === "down right") {
			angle = vec2(1, -1).angle();
		}

		this._messageBroker.publishMessage(
			new ChangeUnitFacingAngleMessage(angle),
			{
				actorIds: [this.castingUnitActorId],
			},
		);
	}

	protected get channelDuration(): number {
		return 0;
	}
}
