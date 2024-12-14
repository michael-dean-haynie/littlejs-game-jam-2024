import type { WeaponTypeName } from "../weapons/weapon";
import { Message } from "./message";

export class PlayerFiredWeaponMessage extends Message {
	constructor(public readonly weaponTypeName: WeaponTypeName) {
		super();
	}
}
