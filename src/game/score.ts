import {
	type UnitCountMap,
	UnitTypeNames,
	createUnitCountMap,
} from "../units/unit";

export class Score {
	readonly kills: UnitCountMap;

	constructor() {
		this.kills = createUnitCountMap();
	}

	get totalKills(): number {
		let total = 0;
		for (const name of UnitTypeNames) {
			total += this.kills[name];
		}
		return total;
	}
}
