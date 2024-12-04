import type { Message, MessageType } from "./message";

export class DamageUnitMessage implements Message {
	constructor(args: Omit<DamageUnitMessage, "type">) {
		this.type = "DamageUnitMessage";
		this.damagedUnitId = args?.damagedUnitId;
		this.damagingUnitId = args?.damagingUnitId;
		this.damage = args?.damage;
	}

	type: MessageType;
	damagedUnitId: string;
	damagingUnitId: string;
	damage: number;
}
