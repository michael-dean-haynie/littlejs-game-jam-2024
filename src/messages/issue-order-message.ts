import type { Order } from "../orders/order";
import { Message } from "./message";

export class IssueOrderMessage extends Message {
	constructor(public readonly order: Order) {
		super();
	}
}
