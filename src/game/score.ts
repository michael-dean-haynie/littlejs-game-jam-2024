import { type UnitCountMap, createUnitCountMap } from "../units/unit";

export class Score {
	readonly kills: UnitCountMap;

	constructor() {
		this.kills = createUnitCountMap();
	}
}
