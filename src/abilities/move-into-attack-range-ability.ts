import type { ActorDirectory } from "../actors/actor-directory";
import { PathingActor } from "../actors/pathing-actor";
import { UnitActor } from "../actors/unit-actor";
import { ChangeUnitVelocityMessage } from "../messages/change-unit-velocity-message";
import type { MessageBroker } from "../messages/message-broker";
import { Ability } from "./ability";
import { UnitFlagCheck } from "./unit-flag-check";
import { UnitHasWeaponEquippedCheck } from "./unit-has-weapon-equipped-check";

export class MoveIntoAttackRangeAbility extends Ability {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _messageBroker: MessageBroker,
		private readonly _targetUnitActorId: string,
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

		// check unit has weapon equipped
		this._checks.push(
			new UnitHasWeaponEquippedCheck(
				this._actorDirectory,
				this.castingUnitActorId,
			),
		);
	}

	protected applyEffects(): void {
		const unitActor = this._actorDirectory.getActorById(
			this.castingUnitActorId,
			UnitActor,
		);

		const targetUnitActor = this._actorDirectory.getActorById(
			this._targetUnitActorId,
			UnitActor,
		);

		const pathingActor = this._actorDirectory.getActorByAlias(
			"pathingActor",
			PathingActor,
		);

		const path = pathingActor.getPath(
			unitActor.pos,
			targetUnitActor.pos,
			unitActor.engineObject,
		);
		const node = path.length > 1 ? path[1] : path[0]; // skip first path node (cause it was rounded to snap to grid)
		const direction = node.subtract(unitActor.pos);
		this._messageBroker.publishMessage(
			new ChangeUnitVelocityMessage(
				direction.normalize(unitActor.unitType.moveSpeed),
				true,
			),
			{
				actorType: UnitActor,
				actorIds: [this.castingUnitActorId],
			},
		);
	}

	protected get channelDuration(): number {
		return 0;
	}
}
