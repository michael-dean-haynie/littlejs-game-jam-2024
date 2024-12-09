import { Message } from "./message";

export class DamageUnitMessage extends Message {
	constructor(
		public readonly damagingUnitActorId: string,
		public readonly damage: number,
	) {
		super();
	}
}
