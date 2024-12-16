import { PI, Sound, SoundWave, clamp } from "littlejsengine";

export const WeaponTypeNames = [
	"animalMele",
	"bat",
	"pistol",
	"shotgun",
] as const;
export type WeaponTypeName = (typeof WeaponTypeNames)[number];

export function IsWeaponTypeName(
	value: string | null,
): value is WeaponTypeName {
	return WeaponTypeNames.includes(value as WeaponTypeName);
}

export interface WeaponType {
	name: WeaponTypeName;
	/** minimum time that must pass after firing a round before another fire or reload */
	cooldownMs: number; // ms
	/** number of rounds before a reload is required */
	clipSize: number;
	/** how long a single reload cycle takes */
	reloadMs: number;
	/** number of rounds a single reload cycle adds */
	reloadRounds: number;
	/** damage inflicted to any hit targets */
	damage: number;
	/** effective range */
	range: number;
	/** angle in radians (3.14 = 180 deg) */
	spread: number;
	/** impace force to apply to hit targets */
	force: number;
	sound: SoundWave;
	soundVolume: number;
	score: number;
}
export type WeaponTypeMap = {
	[K in WeaponTypeName]: WeaponType;
};

export function prepSound(file: string, volume = 1) {
	const sound = new SoundWave(file, 0.15);
	// sound.setVolume(0.001); // bugged for now: https://github.com/KilledByAPixel/LittleJS/issues/127
	return sound;
}

export const WeaponTypes: WeaponTypeMap = {
	animalMele: {
		name: "animalMele",
		cooldownMs: 1000, // maybe base off animal stats?
		clipSize: Number.POSITIVE_INFINITY,
		reloadMs: 0,
		reloadRounds: 0,
		damage: 0, // will calc from animal mass/speed
		range: 0, // will calc from  animal size
		spread: PI / 2, // 90 degres
		force: 1, // will calc from animal mass/speed
		sound: prepSound("/sounds/bat.mp3"),
		soundVolume: 1,
		score: 0,
	},
	bat: {
		name: "bat",
		cooldownMs: 0,
		clipSize: Number.POSITIVE_INFINITY,
		reloadMs: 0,
		reloadRounds: 0,
		damage: 3,
		range: 2,
		spread: PI / 2, // 90 degrees
		force: 0.5,
		sound: prepSound("/sounds/bat.mp3"),
		soundVolume: 1,
		score: 1,
	},
	pistol: {
		name: "pistol",
		cooldownMs: 0,
		clipSize: 10,
		reloadMs: 1000,
		reloadRounds: Number.POSITIVE_INFINITY,
		damage: 5,
		range: 4,
		spread: PI / 20,
		force: 1,
		sound: prepSound("/sounds/gun.mp3"),
		soundVolume: 0.1,
		score: 1,
	},
	shotgun: {
		name: "shotgun",
		cooldownMs: 0,
		clipSize: 2,
		reloadMs: 2000,
		reloadRounds: Number.POSITIVE_INFINITY,
		damage: 10,
		range: 2,
		spread: PI / 4,
		force: 5,
		sound: prepSound("/sounds/gun.mp3"),
		soundVolume: 0.1,
		score: 1,
	},
} as const;

export type WeaponCountMap = {
	[K in WeaponTypeName]: number;
};

export function createWeaponCountMap(): WeaponCountMap {
	const map: Partial<WeaponCountMap> = {};
	for (const weaponTypeName of WeaponTypeNames) {
		map[weaponTypeName] = 0;
	}
	return map as WeaponCountMap;
}

/**
 *********************************************
 * UPGRADES
 *********************************************
 */
export const UpgradableWeaponStats: (keyof WeaponType)[] = [
	"damage",
	"range",
	"reloadMs",
	"clipSize",
	"force",
] as const;

export function upgradableWeaponStatLabel(stat: UpgradableWeaponStat): string {
	if (stat === "reloadMs") {
		return "reload speed";
	}
	return stat;
}

export type UpgradableWeaponStat = (typeof UpgradableWeaponStats)[number];

export interface WeaponUpgradeType {
	/** the weapon type that this upgrade applies to */
	weaponTypeName: WeaponTypeName;
	/** the weapon stat to adjust */
	stat: UpgradableWeaponStat;
	/** the adjustment to make to the stat */
	statAdj: number;
	/** the way to apply the statAdj */
	statAdjType: "flat" | "percentage";
	/** cost to purchase the upgrade */
	cost: number;
	/** the maximum number of times this upgrade can be purchased (stacked) */
	maxStacks: number;
}

export type WeaponUpgradeTypeMap = {
	[K in WeaponTypeName]: WeaponUpgradeType[];
};

export const WeaponUpgradeTypes: WeaponUpgradeTypeMap = {
	animalMele: [],
	bat: [
		{
			weaponTypeName: "bat",
			stat: "damage",
			statAdj: 0.5,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
		// reload speed
		// clip size
		{
			weaponTypeName: "bat",
			stat: "range",
			statAdj: 0.2,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
		{
			weaponTypeName: "bat",
			stat: "force",
			statAdj: 0.5,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
	],
	pistol: [
		{
			weaponTypeName: "pistol",
			stat: "damage",
			statAdj: 0.5,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
		{
			weaponTypeName: "pistol",
			stat: "reloadMs",
			statAdj: -0.1,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
		{
			weaponTypeName: "pistol",
			stat: "clipSize",
			statAdj: 1,
			statAdjType: "flat",
			cost: 500,
			maxStacks: 10,
		},
		{
			weaponTypeName: "pistol",
			stat: "range",
			statAdj: 0.2,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
		{
			weaponTypeName: "pistol",
			stat: "force",
			statAdj: 0.2,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
	],
	shotgun: [
		{
			weaponTypeName: "shotgun",
			stat: "damage",
			statAdj: 0.5,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
		{
			weaponTypeName: "shotgun",
			stat: "reloadMs",
			statAdj: -0.1,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
		{
			weaponTypeName: "shotgun",
			stat: "clipSize",
			statAdj: 1,
			statAdjType: "flat",
			cost: 500,
			maxStacks: 10,
		},
		{
			weaponTypeName: "shotgun",
			stat: "range",
			statAdj: 0.2,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
		{
			weaponTypeName: "shotgun",
			stat: "force",
			statAdj: 0.2,
			statAdjType: "percentage",
			cost: 500,
			maxStacks: 10,
		},
	],
} as const;

/** returns the value of a weapon stat after stacks of upgrades have been applied */
export function weaponStatUpgradedValue(
	weaponName: WeaponTypeName,
	stat: UpgradableWeaponStat,
	stacks: number,
): number {
	const baseVal = weaponStatBase(weaponName, stat);
	let upgradedVal = baseVal;

	for (let stack = 0; stack < stacks; stack++) {
		upgradedVal += weaponStatUpgradeAdjustment(weaponName, stat);
	}

	return clamp(upgradedVal, 0, Number.POSITIVE_INFINITY);
}

/** returns the base value of an upgradable stat for a weapon (casted as a number) */
export function weaponStatBase(
	weaponName: WeaponTypeName,
	stat: UpgradableWeaponStat,
): number {
	const result = WeaponTypes[weaponName][stat] as number; // upgradable stats are all numbers (at least for now)
	if (stat === "reloadMs") {
		return result === 0 ? Number.POSITIVE_INFINITY : result;
	}
	return result;
}

/** returns the value amount that a stat is modified as a result of applying 1 upgrade */
export function weaponStatUpgradeAdjustment(
	weaponName: WeaponTypeName,
	stat: UpgradableWeaponStat,
): number {
	const upgrade = WeaponUpgradeTypes[weaponName].find(
		(upgrade) => upgrade.stat === stat,
	);
	if (!upgrade) {
		return 0; // there just aren't any upgrades for this weapon/stat
	}

	const baseVal = weaponStatBase(weaponName, stat);
	switch (upgrade.statAdjType) {
		case "flat":
			return upgrade.statAdj;
		case "percentage":
			return baseVal * upgrade.statAdj;
		default:
			throw new Error("unexpected upgrade adjustment type");
	}
}

/** returns the number of times an upgrade can be stacked for a particular weapon/stat */
export function weaponStatStacks(
	weaponName: WeaponTypeName,
	stat: UpgradableWeaponStat,
): number {
	const upgrade = WeaponUpgradeTypes[weaponName].find(
		(upgrade) => upgrade.stat === stat,
	);
	if (!upgrade) {
		return 0; // there just aren't any upgrades for this weapon/stat
	}
	return upgrade.maxStacks;
}

/* returns the min and max values possible for a particular weapon and stat (including upgrades)*/
export function minMaxWeaponStat(
	weaponName: WeaponTypeName,
	stat: UpgradableWeaponStat,
): [number, number] {
	const baseVal = weaponStatBase(weaponName, stat);
	let upgradedVal = baseVal;

	for (let stack = 0; stack < weaponStatStacks(weaponName, stat); stack++) {
		upgradedVal += weaponStatUpgradeAdjustment(weaponName, stat);
	}

	const min = Math.min(baseVal, upgradedVal);
	const max = Math.max(baseVal, upgradedVal);
	return [min, max];
}

/* returns the min and max values possible for a particular stat across all weapons (including upgrades)*/
export function minMaxStat(stat: UpgradableWeaponStat): [number, number] {
	const values = WeaponTypeNames.flatMap((weaponName) =>
		minMaxWeaponStat(weaponName, stat),
	).filter((value) => Number.isFinite(value)); // remove infinite values

	const min = Math.min(...values);
	const max = Math.max(...values);
	return [min, max];
}

/** returns the value range that the stat bar will cover for a particular stat */
export function statDisplayRange(stat: UpgradableWeaponStat): number {
	const [min, max] = minMaxStat(stat);
	// if (stat === "reloadMs") {
	// 	return max - min; // will be inverted into "reload speed" (from max ms on the left to the lowest ms on the right)
	// }
	return max; // everything else will be shown in relation to 0 (from 0 on the left to max on the right)
}

/** returns a decimal percentage (0-1) indicating how much of the bar a single upgrade increment for a particular weapon/stat takes up */
export function weaponStatSgmtPctg(
	weaponName: WeaponTypeName,
	stat: UpgradableWeaponStat,
): number {
	return (
		Math.abs(weaponStatUpgradeAdjustment(weaponName, stat)) /
		statDisplayRange(stat)
	);
}

/** returns a decimal percentage (0-1) indicating how much of the bar the base value for a particular weapon/stat takes up */
export function weaponStatBasePctg(
	weaponName: WeaponTypeName,
	stat: UpgradableWeaponStat,
): number {
	const base = weaponStatBase(weaponName, stat);
	const range = statDisplayRange(stat);
	if (stat === "reloadMs") {
		return (range - base) / range; // invert into "reload speed"
	}
	return base / range;
}
