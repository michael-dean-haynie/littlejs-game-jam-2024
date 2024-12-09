import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import { AbilityCheck } from "./ability-check";

export class UnitInRangeCheck extends AbilityCheck {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _castingUnitActorId: string,
		private readonly _targetUnitActorId: string,
		private readonly _range: number,
	) {
		super();
	}

	check(): boolean {
		const castingUnitActor = this._actorDirectory.getActorById(
			this._castingUnitActorId,
			UnitActor,
		);
		const targetUnitActor = this._actorDirectory.getActorById(
			this._targetUnitActorId,
			UnitActor,
		);
		return (
			castingUnitActor.pos.distance(targetUnitActor.pos) -
				targetUnitActor.size.x / 2 <=
			this._range
		);
	}
}
