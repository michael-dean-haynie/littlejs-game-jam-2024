import type { WeaponType } from "../weapons/weapon";
import type { Message, MessageType } from "./message";

export class AddWeaponToUnitMessage implements Message {
	constructor(args: Omit<AddWeaponToUnitMessage, "type">) {
		this.type = "AddWeaponToUnitMessage";
		this.weaponType = args?.weaponType;
		this.unitId = args?.unitId;
	}

	type: MessageType;
	weaponType: WeaponType;
	unitId: string;
}

export function IsAddWeaponToUnitMessage(
	value: Message | null,
): value is AddWeaponToUnitMessage {
	return value?.type === "AddWeaponToUnitMessage";
}
