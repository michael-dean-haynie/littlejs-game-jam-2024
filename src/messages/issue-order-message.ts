import type { Order } from "../orders/order";
import type { Message, MessageType } from "./message";

export class IssueOrderMessage implements Message {
	constructor(args: Omit<IssueOrderMessage, "type">) {
		this.type = "IssueOrderMessage";
		this.order = args.order;
		this.targetUnitId = args.targetUnitId;
	}

	type: MessageType;
	order: Order;
	targetUnitId: string;
}

export function IsIssueOrderMessage(
	value: Message | null,
): value is IssueOrderMessage {
	return value?.type === "IssueOrderMessage";
}
