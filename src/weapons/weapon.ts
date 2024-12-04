export const WeaponTypeNames = ["fists", "pistol", "shotgun"] as const;
export type WeaponTypeName = (typeof WeaponTypeNames)[number];

export function IsWeaponTypeName(
	value: string | null,
): value is WeaponTypeName {
	return WeaponTypeNames.includes(value as WeaponTypeName);
}

export interface WeaponType {
	name: WeaponTypeName;
	speed: number;
	damage: number;
}
export type WeaponTypeMap = {
	[K in WeaponTypeName]: WeaponType;
};

export const WeaponTypes: WeaponTypeMap = {
	fists: {
		name: "fists",
		speed: 1,
		damage: 1,
	},
	pistol: {
		name: "pistol",
		speed: 1,
		damage: 1,
	},
	shotgun: {
		name: "shotgun",
		speed: 1,
		damage: 10,
	},
} as const;
