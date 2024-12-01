import type { UnitActor } from "../actors/unit-actor";

export interface Order {
	type: OrderType;
}

export const OrderTypes = ["MoveInDirectionOrder"] as const;
export type OrderType = (typeof OrderTypes)[number];

export function IsOrderType(value: string | null): value is OrderType {
	return OrderTypes.includes(value as OrderType);
}
