import type { WeaponType } from "../weapons/weapon";
import type { Order, OrderProgress, OrderType } from "./order";

export class EquipWeaponOrder implements Order {
	constructor(args: Omit<EquipWeaponOrder, "type" | "progress">) {
		this.type = "EquipWeaponOrder";
		this.progress = "pending";
		this.weaponType = args?.weaponType;
	}

	type: OrderType;
	progress: OrderProgress;
	weaponType: WeaponType;
}
