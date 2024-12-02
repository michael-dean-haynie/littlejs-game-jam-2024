import type { UnitActor } from "../actors/unit-actor";
import type { Order, OrderProgress, OrderType } from "./order";

export class StopMovingOrder implements Order {
	constructor(args: Omit<StopMovingOrder, "type" | "progress"> = {}) {
		this.type = "StopMovingOrder";
		this.progress = "pending";
	}

	type: OrderType;
	progress: OrderProgress;
}
