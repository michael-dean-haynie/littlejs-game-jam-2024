import { Color, rgb } from "littlejsengine";
import { type WeaponType, WeaponTypes } from "../weapons/weapon";

export const UnitTypeNames = ["prey", "rabbit", "pig"] as const;
export type UnitTypeName = (typeof UnitTypeNames)[number];

export function IsUnitTypeName(value: string | null): value is UnitTypeName {
	return UnitTypeNames.includes(value as UnitTypeName);
}

export interface UnitType {
	name: UnitTypeName;
	moveSpeed: number;
	size: number;
	mass: number;
	color: Color;
	defaultWeapons: WeaponType[];
	hitpoints: number;
}
export type UnitTypeMap = {
	[K in UnitTypeName]: UnitType;
};

export const UnitTypes: UnitTypeMap = {
	prey: {
		name: "prey",
		moveSpeed: 0.1,
		size: 1,
		mass: 10,
		color: new Color().setHex("#FF5733"), // orange
		defaultWeapons: [WeaponTypes.shotgun],
		hitpoints: 100,
	},
	rabbit: {
		name: "rabbit",
		moveSpeed: 0.05,
		size: 1,
		mass: 1,
		color: rgb(1, 1, 1, 1), // white
		defaultWeapons: [WeaponTypes.fists],
		hitpoints: 10,
	},
	pig: {
		name: "pig",
		moveSpeed: 0.025,
		size: 1,
		mass: 5,
		color: rgb(255 / 255, 192 / 255, 203 / 255, 1), // pink?
		defaultWeapons: [WeaponTypes.fists],
		hitpoints: 40,
	},
} as const;
