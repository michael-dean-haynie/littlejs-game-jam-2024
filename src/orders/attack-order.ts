import type { Order, OrderProgress, OrderType } from "./order";

export class AttackInDirectionOrder implements Order {
	constructor(args: Omit<AttackInDirectionOrder, "type" | "progress"> = {}) {
		this.type = "AttackInDirectionOrder";
		this.progress = "pending";
	}

	type: OrderType;
	progress: OrderProgress;
}
