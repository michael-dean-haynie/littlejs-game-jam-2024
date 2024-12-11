import { type Vector2, vec2 } from "littlejsengine";
import type { ActorDirectory } from "../actors/actor-directory";
import type { Direction } from "../actors/input-actor";
import { UnitActor } from "../actors/unit-actor";
import { ChangeUnitVelocityMessage } from "../messages/change-unit-velocity-message";
import type { MessageBroker } from "../messages/message-broker";
import { yeet } from "../utilities/utilities";
import { Ability } from "./ability";
import { UnitFlagCheck } from "./unit-flag-check";

export class MoveInDirectionAbility extends Ability {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _messageBroker: MessageBroker,
		private readonly _direction: Direction,
		...params: ConstructorParameters<typeof Ability>
	) {
		super(...params);
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

	protected applyEffects(): void {
		const unitActor =
			this._actorDirectory.getActor(this.castingUnitActorId, UnitActor) ??
			yeet();

		const ms = unitActor.unitType.moveSpeed;
		let velocity: Vector2 = vec2(); // will be overwritten

		if (this._direction === "up") {
			velocity = vec2(0, 1).normalize(ms);
		}
		if (this._direction === "left") {
			velocity = vec2(-1, 0).normalize(ms);
		}
		if (this._direction === "down") {
			velocity = vec2(0, -1).normalize(ms);
		}
		if (this._direction === "right") {
			velocity = vec2(1, 0).normalize(ms);
		}
		if (this._direction === "up left") {
			velocity = vec2(-1, 1).normalize(ms);
		}
		if (this._direction === "down left") {
			velocity = vec2(-1, -1).normalize(ms);
		}
		if (this._direction === "up right") {
			velocity = vec2(1, 1).normalize(ms);
		}
		if (this._direction === "down right") {
			velocity = vec2(1, -1).normalize(ms);
		}

		this._messageBroker.publishMessage(
			new ChangeUnitVelocityMessage(velocity, true),
			{
				actorIds: [this.castingUnitActorId],
			},
		);
	}

	protected get channelDuration(): number {
		return 0;
	}
}
