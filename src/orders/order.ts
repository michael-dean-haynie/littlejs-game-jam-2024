import type { UnitActor } from "../actors/unit-actor";

export interface Order {
	type: OrderType;
	progress: OrderProgress;
}

export const OrderTypes = [
	"MoveInDirectionOrder",
	"StopMovingOrder",
	"FollowUnitOrder",
] as const;
export type OrderType = (typeof OrderTypes)[number];

export function IsOrderType(value: string | null): value is OrderType {
	return OrderTypes.includes(value as OrderType);
}

export const OrderProgresses = ["pending", "in progress", "complete"] as const;
export type OrderProgress = (typeof OrderProgresses)[number];

export function IsOrderProgress(value: string | null): value is OrderProgress {
	return OrderProgresses.includes(value as OrderProgress);
}
