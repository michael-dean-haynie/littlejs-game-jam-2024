import type { ActorDirectory } from "../actors/actor-directory";
import { WeaponActor } from "../actors/weapon-actor";
import { AbilityCheck } from "./ability-check";

export class WeaponOffCooldownCheck extends AbilityCheck {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _weaponActorId: string,
	) {
		super();
	}

	check(): boolean {
		const weaponActor = this._actorDirectory.getActor(
			this._weaponActorId,
			WeaponActor,
		);
		return weaponActor.offCooldown;
	}
}
