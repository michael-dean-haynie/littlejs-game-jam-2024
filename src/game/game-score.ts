import { initRecord, yeet } from "../utilities/utilities";
import {
	type UpgradableWeaponStat,
	UpgradableWeaponStats,
	type WeaponTypeName,
	WeaponTypeNames,
} from "../weapons/weapon";
import type { RoundScore } from "./round-score";

/** the persistant score across all rounds */
export class GameScore {
	public readonly roundScores: RoundScore[];
	public difficulty: number;
	public unlockedWeapons: Record<WeaponTypeName, boolean>;
	public weaponSlots: Array<WeaponTypeName | null>;
	public weaponUpgrades: Record<
		WeaponTypeName,
		Record<UpgradableWeaponStat, number>
	>;
	public spendablePoints: number;

	constructor() {
		this.roundScores = [];
		this.difficulty = 1;
		this.spendablePoints = 0;

		this.unlockedWeapons = initRecord(WeaponTypeNames, false);
		this.unlockedWeapons.bat = true;

		this.weaponSlots = ["bat", null];

		// init weaponUpgrades
		this.weaponUpgrades = initRecord(
			WeaponTypeNames,
			initRecord(UpgradableWeaponStats, 0),
		);
	}

	get curRoundScore(): RoundScore {
		return this.roundScores.at(-1) ?? yeet();
	}
}
