import { yeet } from "../utilities/utilities";
import type { AbilityCheck } from "./ability-check";

export abstract class Ability {
	constructor() {
		this._stage = "init";
		this._checks = [];
		this._failedCheck = null;
		this._channelStart = null;
		this._castingUnitActorId = null; // should be injected by order after construction
		this._destroyed = false;
	}

	private _destroyed;
	public get destroyed() {
		return this._destroyed;
	}

	protected _checks: AbilityCheck[];

	private _stage: AbilityStage;
	get stage(): AbilityStage {
		return this._stage;
	}

	private _failedCheck: AbilityCheck | null;
	get failedCheck(): AbilityCheck | null {
		return this._failedCheck;
	}

	private _castingUnitActorId: string | null;
	get castingUnitActorId(): string {
		return this._castingUnitActorId ?? yeet("UNEXPECTED_NULLISH_VALUE");
	}
	set castingUnitActorId(value: string) {
		this._castingUnitActorId = value;
		this.initializeAbility();
	}

	private _channelStart: number | null;
	protected abstract get channelDuration(): number;

	destroy(): void {
		this._stage = "complete";
		this._destroyed = true;
	}

	tryToProgress(): AbilityStage {
		if (this.destroyed) {
			this._stage = "complete";
			return this.stage;
		}

		// init
		if (this.stage === "init") {
			this._stage = "check";
		}

		// check
		if (this.stage === "check") {
			for (const check of this._checks) {
				if (this.destroyed) {
					this._stage = "complete";
					break;
				}
				if (!check.check()) {
					this._failedCheck = check;
					this._stage = "check failed";
				}
			}
			if (this._stage !== "check failed") {
				this._stage = "channel";
			}
		}

		// check failed
		if (this.stage === "check failed") {
			// do nothing (stage will be returned below)
		}

		// channel
		if (this.stage === "channel") {
			if (this._channelStart === null) {
				this._channelStart = Date.now();
			}
			if (Date.now() >= this._channelStart + this.channelDuration) {
				this._channelStart = null;
				this._stage = "apply";
			}
		}

		// apply
		if (this.stage === "apply") {
			this.applyEffects();
			this._stage = "complete";
		}

		// complete
		if (this.stage === "complete") {
			// do nothing (stage will be returned below)
		}

		return this._stage;
	}

	resetProgress(): void {
		this._stage = "init";
	}

	protected abstract applyEffects(): void;

	protected abstract initializeAbility(): void;
}

export const AbilityStages = [
	"init",
	"check",
	"check failed",
	"channel",
	"apply",
	"complete",
] as const;
export type AbilityStage = (typeof AbilityStages)[number];

export function IsActorDirectoryAlias(
	value: string | null,
): value is AbilityStage {
	return AbilityStages.includes(value as AbilityStage);
}
