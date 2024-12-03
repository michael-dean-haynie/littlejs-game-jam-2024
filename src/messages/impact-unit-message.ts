import type { Vector2 } from "littlejsengine";
import type { Message, MessageType } from "./message";

export class ImpactUnitMessage implements Message {
	constructor(args: Omit<ImpactUnitMessage, "type">) {
		this.type = "ImpactUnitMessage";
		this.force = args.force;
		this.impactedUnitId = args.impactedUnitId;
	}

	type: MessageType;
	force: Vector2;
	impactedUnitId: string;
}

export function IsImpactUnitMessage(
	value: Message | null,
): value is ImpactUnitMessage {
	return value?.type === "ImpactUnitMessage";
}
