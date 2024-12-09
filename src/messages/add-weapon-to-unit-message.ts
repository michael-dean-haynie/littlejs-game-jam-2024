import type { WeaponType } from "../weapons/weapon";
import { Message } from "./message";

export class AddWeaponToUnitMessage extends Message {
	constructor(public readonly weaponType: WeaponType) {
		super();
	}
}
