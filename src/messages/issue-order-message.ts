import type { Order } from "../orders/order";
import type { Message, MessageType } from "./message";

export class IssueOrderMessage implements Message {
	constructor(args: Omit<IssueOrderMessage, "type">) {
		this.type = "IssueOrderMessage";
		this.order = args.order;
		this.orderedUnitId = args.orderedUnitId;
	}

	type: MessageType;
	order: Order;
	orderedUnitId: string;
}

export function IsIssueOrderMessage(
	value: Message | null,
): value is IssueOrderMessage {
	return value?.type === "IssueOrderMessage";
}
