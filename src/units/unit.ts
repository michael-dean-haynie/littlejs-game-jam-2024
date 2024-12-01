export const UnitTypeNames = ["prey", "bunny", "pig"] as const;
export type UnitTypeName = (typeof UnitTypeNames)[number];

export function IsUnitTypeName(value: string | null): value is UnitTypeName {
	return UnitTypeNames.includes(value as UnitTypeName);
}

export interface UnitType {
	name: UnitTypeName;
	moveSpeed: number;
}
export type UnitTypeMap = {
	[K in UnitTypeName]: UnitType;
};

export const UnitTypes: UnitTypeMap = {
	prey: {
		name: "prey",
		moveSpeed: 0.2,
	},
	bunny: {
		name: "bunny",
		moveSpeed: 0.1,
	},
	pig: {
		name: "pig",
		moveSpeed: 0.1,
	},
} as const;
