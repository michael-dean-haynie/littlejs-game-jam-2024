import { type Color, rgb } from "littlejsengine";

export const UnitTypeNames = ["prey", "bunny", "pig"] as const;
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
}
export type UnitTypeMap = {
	[K in UnitTypeName]: UnitType;
};

export const UnitTypes: UnitTypeMap = {
	prey: {
		name: "prey",
		moveSpeed: 0.3,
		size: 1,
		mass: 10,
		color: rgb(0, 1, 0, 1), // green
	},
	bunny: {
		name: "bunny",
		moveSpeed: 0.2,
		size: 0.25,
		mass: 1,
		color: rgb(1, 1, 1, 1), // white
	},
	pig: {
		name: "pig",
		moveSpeed: 0.1,
		size: 0.5,
		mass: 5,
		color: rgb(255 / 255, 192 / 255, 203 / 255, 1), // pink?
	},
} as const;
