import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import { yeet } from "../utilities/utilities";
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
		const castingUnitActor =
			this._actorDirectory.getActor(this._castingUnitActorId, UnitActor) ??
			yeet();
		const targetUnitActor =
			this._actorDirectory.getActor(this._targetUnitActorId, UnitActor) ??
			yeet();
		return (
			castingUnitActor.pos.distance(targetUnitActor.pos) -
				targetUnitActor.size.x / 2 <=
			this._range
		);
	}
}
