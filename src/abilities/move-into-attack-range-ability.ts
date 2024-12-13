import { debugRect, vec2 } from "littlejsengine";
import type { ActorDirectory } from "../actors/actor-directory";
import { PathingActor } from "../actors/pathing-actor";
import { UnitActor } from "../actors/unit-actor";
import { ChangeUnitVelocityMessage } from "../messages/change-unit-velocity-message";
import type { MessageBroker } from "../messages/message-broker";
import { yeet } from "../utilities/utilities";
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
		const unitActor = this._actorDirectory.getActor(
			this.castingUnitActorId,
			UnitActor,
		);

		const targetUnitActor = this._actorDirectory.getActor(
			this._targetUnitActorId,
			UnitActor,
		);

		const pathingActor = this._actorDirectory.getActorByAlias(
			"pathingActor",
			PathingActor,
		);

		if (!unitActor || !targetUnitActor || !pathingActor) {
			return; // do nothing, it will keep trying
		}

		const path = pathingActor.getPath(unitActor.pos, targetUnitActor.pos);

		if (!path) {
			throw new Error("could not find path");
		}

		// for (const wpNode of path) {
		// 	debugRect(wpNode, vec2(1, 1), "#fff");
		// }

		const node = path.length > 1 ? path[1] : path[0]; // skip first path node (cause it was rounded to snap to grid)
		const direction = node.subtract(unitActor.pos);
		this._messageBroker.publishMessage(
			new ChangeUnitVelocityMessage(
				direction.normalize(unitActor.unitType.moveSpeed),
				true,
			),
			{
				actorIds: [this.castingUnitActorId],
			},
		);
	}

	protected get channelDuration(): number {
		return 0;
	}
}
