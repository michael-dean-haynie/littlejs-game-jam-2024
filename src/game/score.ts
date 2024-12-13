import {
	type UnitCountMap,
	UnitTypeNames,
	createUnitCountMap,
} from "../units/unit";

export class Score {
	readonly kills: UnitCountMap;

	/** start timestamp for this round */
	private readonly _start: number;
	/** end timestamp for this round */
	public end: number | null;

	constructor() {
		this.kills = createUnitCountMap();
		this._start = Date.now();
		this.end = null;
	}

	/** total kills from the current round */
	get totalKills(): number {
		let total = 0;
		for (const name of UnitTypeNames) {
			total += this.kills[name];
		}
		return total;
	}

	/** how long the round has lasted (in ms) */
	get duration(): number {
		return (this.end || Date.now()) - this._start;
	}
}
