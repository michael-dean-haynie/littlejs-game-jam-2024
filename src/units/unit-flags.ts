export const UnitFlagNames = [
	"impacted", // current movement the result of some sort of attack colision, not self propelled
] as const;
export type UnitFlagName = (typeof UnitFlagNames)[number];
export type UnitFlagMap = { [key in UnitFlagName]: boolean };
export type UnitFlagMapOptional = { [key in UnitFlagName]?: boolean };

export function IsAbilityStage(value: string | null): value is UnitFlagName {
	return UnitFlagNames.includes(value as UnitFlagName);
}

export class UnitFlags implements UnitFlagMap {
	constructor() {
		this._data = {};
	}

	private readonly _data: UnitFlagMapOptional;

	get impacted() {
		return this._data.impacted || false;
	}
	set impacted(value: boolean) {
		this._data.impacted = value;
	}
}
