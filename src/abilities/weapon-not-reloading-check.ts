import type { ActorDirectory } from "../actors/actor-directory";
import { WeaponActor } from "../actors/weapon-actor";
import { yeet } from "../utilities/utilities";
import { AbilityCheck } from "./ability-check";

export class WeaponNotReloadingCheck extends AbilityCheck {
	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _weaponActorId: string,
	) {
		super();
	}

	check(): boolean {
		const weaponActor =
			this._actorDirectory.getActor(this._weaponActorId, WeaponActor) ?? yeet();
		return !weaponActor.flags.reloading;
	}
}
