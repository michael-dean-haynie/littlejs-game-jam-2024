import { Color, rgb } from "littlejsengine";
import { type WeaponType, WeaponTypes } from "../weapons/weapon";

export const UnitTypeNames = ["prey", "mouse", "rabbit", "pig"] as const;
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
	score: number;
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
		color: new Color().setHex("#3498db"), // blue
		defaultWeapons: [],
		hitpoints: 10,
		score: 0,
	},
	mouse: {
		name: "mouse",
		moveSpeed: 0.05,
		size: 0.5,
		mass: 1,
		color: new Color().setHex("#7f8c8d"), // grey
		defaultWeapons: [WeaponTypes.animalMele],
		hitpoints: 5,
		score: 5,
	},
	rabbit: {
		name: "rabbit",
		moveSpeed: 0.075,
		size: 0.75,
		mass: 2,
		color: rgb(1, 1, 1, 1), // white
		defaultWeapons: [WeaponTypes.animalMele],
		hitpoints: 10,
		score: 10,
	},
	pig: {
		name: "pig",
		moveSpeed: 0.025,
		size: 1,
		mass: 8,
		color: rgb(255 / 255, 192 / 255, 203 / 255, 1), // pink?
		defaultWeapons: [WeaponTypes.animalMele],
		hitpoints: 30,
		score: 30,
	},
} as const;

export type UnitCountMap = {
	[K in UnitTypeName]: number;
};

export function createUnitCountMap(): UnitCountMap {
	const map: Partial<UnitCountMap> = {};
	for (const unitTypeName of UnitTypeNames) {
		map[unitTypeName] = 0;
	}
	return map as UnitCountMap;
}
