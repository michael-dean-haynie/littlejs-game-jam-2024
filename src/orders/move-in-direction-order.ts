import type { Direction } from "../helpers/input";
import type { Order, OrderProgress, OrderType } from "./order";

export class MoveInDirectionOrder implements Order {
	constructor(args: Omit<MoveInDirectionOrder, "type" | "progress">) {
		this.type = "MoveInDirectionOrder";
		this.progress = "pending";
		this.direction = args.direction;
	}

	type: OrderType;
	progress: OrderProgress;
	direction: Direction;
}
