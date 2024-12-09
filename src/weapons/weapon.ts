import { PI } from "littlejsengine";

export const WeaponTypeNames = ["fists", "pistol", "shotgun"] as const;
export type WeaponTypeName = (typeof WeaponTypeNames)[number];

export function IsWeaponTypeName(
	value: string | null,
): value is WeaponTypeName {
	return WeaponTypeNames.includes(value as WeaponTypeName);
}

export interface WeaponType {
	name: WeaponTypeName;
	cooldown: number; // ms
	damage: number;
	range: number;
	/** angle in radians (3.14 = 180 deg) */
	spread: number;
	force: number;
}
export type WeaponTypeMap = {
	[K in WeaponTypeName]: WeaponType;
};

export const WeaponTypes: WeaponTypeMap = {
	fists: {
		name: "fists",
		cooldown: 1000,
		damage: 1,
		range: 1,
		spread: PI / 2, // 90 degrees
		force: 1,
	},
	pistol: {
		name: "pistol",
		cooldown: 0,
		damage: 1,
		range: 1,
		spread: 0,
		force: 1,
	},
	shotgun: {
		name: "shotgun",
		cooldown: 0,
		damage: 10,
		range: 2,
		spread: PI / 2, // 90 degrees
		force: 5,
	},
} as const;
