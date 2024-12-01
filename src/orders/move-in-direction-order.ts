import type { UnitActor } from "../actors/unit-actor";
import type { Direction } from "../helpers/input";
import type { Order, OrderType } from "./order";

export class MoveInDirectionOrder implements Order {
	constructor(args: Omit<MoveInDirectionOrder, "type">) {
		this.type = "MoveInDirectionOrder";
		this.direction = args.direction;
	}

	type: OrderType;
	direction: Direction;
}
