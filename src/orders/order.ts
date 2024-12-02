import type { UnitActor } from "../actors/unit-actor";

export interface Order {
	type: OrderType;
	hasCompleted: (order: Order) => boolean;
}

export const OrderTypes = ["MoveInDirectionOrder", "FollowUnitOrder"] as const;
export type OrderType = (typeof OrderTypes)[number];

export function IsOrderType(value: string | null): value is OrderType {
	return OrderTypes.includes(value as OrderType);
}

export const orderNeverCompletes = (order: Order): boolean => {
	return false;
};
export const orderImmediatelyCompletes = (order: Order): boolean => {
	return true;
};
