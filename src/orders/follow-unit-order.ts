import type { Order, OrderProgress, OrderType } from "./order";

export class FollowUnitOrder implements Order {
	constructor(args: Omit<FollowUnitOrder, "type" | "progress">) {
		this.type = "FollowUnitOrder";
		this.progress = "pending";
		this.targetUnitId = args.targetUnitId;
	}

	type: OrderType;
	progress: OrderProgress;
	targetUnitId: string;
}
