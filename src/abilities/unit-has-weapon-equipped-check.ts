import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import { AbilityCheck } from "./ability-check";

export class UnitHasWeaponEquippedCheck extends AbilityCheck {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _castingUnitActorId: string,
	) {
		super();
	}

	check(): boolean {
		const castingUnitActor = this._actorDirectory.getActor(
			this._castingUnitActorId,
			UnitActor,
		);
		return castingUnitActor.equippedWeaponActorId !== null;
	}
}
