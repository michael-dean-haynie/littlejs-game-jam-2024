import type { Order, OrderProgress, OrderType } from "./order";

export class AttackOrder implements Order {
	constructor(args: Omit<AttackOrder, "type" | "progress"> = {}) {
		this.type = "AttackOrder";
		this.progress = "pending";
	}

	type: OrderType;
	progress: OrderProgress;
}
