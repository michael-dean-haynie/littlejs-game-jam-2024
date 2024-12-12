export const UnitFlagNames = [
	/** current movement the result of some sort of attack colision, not self propelled */
	"impacted",
	/** has sustained fatal damage, (probably waiting to come off of "impacted" before being destroyed) */
	"dying",
] as const;
export type UnitFlagName = (typeof UnitFlagNames)[number];
export type UnitFlagMap = { [key in UnitFlagName]: boolean };
export type UnitFlagMapOptional = { [key in UnitFlagName]?: boolean };

export function IsUnitFlagName(value: string | null): value is UnitFlagName {
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

	get dying() {
		return this._data.dying || false;
	}
	set dying(value: boolean) {
		this._data.dying = value;
	}
}
