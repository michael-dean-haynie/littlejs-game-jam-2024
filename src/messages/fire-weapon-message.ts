import type { WeaponType } from "../weapons/weapon";
import type { Message, MessageType } from "./message";

export class FireWeaponMessage implements Message {
	constructor(args: Omit<FireWeaponMessage, "type">) {
		this.type = "FireWeaponMessage";
		this.firingUnitId = args?.firingUnitId;
	}

	type: MessageType;
	firingUnitId: string;
}

// TODO: can probably just use "instanceof" for these message classes
export function IsFireWeaponMessage(
	value: Message | null,
): value is FireWeaponMessage {
	return value?.type === "FireWeaponMessage";
}
