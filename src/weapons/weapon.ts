import { PI } from "littlejsengine";

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
	animalMele: {
		name: "animalMele",
		cooldown: 1000,
		damage: 1,
		range: 1,
		spread: PI / 2, // 90 degrees
		force: 1,
	},
	bat: {
		name: "bat",
		cooldown: 0,
		damage: 5,
		range: 2,
		spread: PI / 2, // 90 degrees
		force: 0.5,
	},
	pistol: {
		name: "pistol",
		cooldown: 0,
		damage: 5,
		range: 5,
		spread: PI / 20,
		force: 1,
	},
	shotgun: {
		name: "shotgun",
		cooldown: 1000,
		damage: 10,
		range: 2,
		spread: PI / 2, // 90 degrees
		force: 5,
	},
} as const;
