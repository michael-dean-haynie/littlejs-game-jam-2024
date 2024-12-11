import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import type { UnitFlagName } from "../units/unit-flags";
import { yeet } from "../utilities/utilities";
import { AbilityCheck } from "./ability-check";

export class UnitFlagCheck extends AbilityCheck {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _targetUnitActorId: string,
		private readonly _unitFlagName: UnitFlagName,
		private readonly _expectedFlagValue: boolean,
	) {
		super();
	}

	check(): boolean {
		const targetUnitActor =
			this._actorDirectory.getActor(this._targetUnitActorId, UnitActor) ??
			yeet();
		return (
			targetUnitActor.flags[this._unitFlagName] === this._expectedFlagValue
		);
	}
}
