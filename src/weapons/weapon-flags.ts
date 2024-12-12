export const WeaponFlagNames = [
	/** weapon is currently being reloaded */
	"reloading",
	/** weapon cannot fire/reload until cooldown has completed */
	"onCooldown",
	/** reload will need to happen before weapon can fire again */
	"clipIsEmpty",
	/** reload will need to happen before weapon can fire again */
	"clipIsFull",
] as const;
export type WeaponFlagName = (typeof WeaponFlagNames)[number];
export type WeaponFlagMap = { [key in WeaponFlagName]: boolean };
export type WeaponFlagMapOptional = { [key in WeaponFlagName]?: boolean };

export function IsWeaponFlagName(
	value: string | null,
): value is WeaponFlagName {
	return WeaponFlagNames.includes(value as WeaponFlagName);
}

export class WeaponFlags implements WeaponFlagMap {
	constructor() {
		this._data = {};
	}

	private readonly _data: WeaponFlagMapOptional;

	get reloading() {
		return this._data.reloading || false;
	}
	set reloading(value: boolean) {
		this._data.reloading = value;
	}

	get onCooldown() {
		return this._data.onCooldown || false;
	}
	set onCooldown(value: boolean) {
		this._data.onCooldown = value;
	}

	get clipIsEmpty() {
		return this._data.clipIsEmpty || false;
	}
	set clipIsEmpty(value: boolean) {
		this._data.clipIsEmpty = value;
	}

	get clipIsFull() {
		return this._data.clipIsFull || false;
	}
	set clipIsFull(value: boolean) {
		this._data.clipIsFull = value;
	}
}
