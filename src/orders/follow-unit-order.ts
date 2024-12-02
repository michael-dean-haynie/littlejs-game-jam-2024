import { type Order, type OrderType, orderNeverCompletes } from "./order";

export class FollowUnitOrder implements Order {
	constructor(args: Omit<FollowUnitOrder, "type" | "hasCompleted">) {
		this.type = "FollowUnitOrder";
		this.targetUnitId = args.targetUnitId;
	}

	type: OrderType;
	targetUnitId: string;

	hasCompleted = orderNeverCompletes;
}
