import { formatTime } from "littlejsengine";
import {
	type UnitCountMap,
	type UnitTypeName,
	UnitTypeNames,
	UnitTypes,
	createUnitCountMap,
} from "../units/unit";
import {
	type WeaponCountMap,
	type WeaponTypeName,
	WeaponTypeNames,
	WeaponTypes,
	createWeaponCountMap,
} from "../weapons/weapon";

export class RoundScore {
	readonly kills: UnitCountMap;
	readonly shots: WeaponCountMap;

	/** start timestamp for this round */
	private readonly _start: number;
	/** end timestamp for this round */
	public end: number | null;

	constructor() {
		this.kills = createUnitCountMap();
		this.shots = createWeaponCountMap();
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

	/** the score from the total kills from the current round */
	get totalKillsScore(): number {
		let total = 0;
		for (const name of UnitTypeNames) {
			total += this.killsScore(name);
		}
		return total;
	}

	/** get sorted kills row data for each unit type (skpping prey) */
	get killsScoreRows(): Array<{ name: string; value: number; score: number }> {
		return UnitTypeNames.filter((name) => name !== UnitTypes.prey.name)
			.map((name) => ({
				name: name,
				value: this.kills[name],
				score: this.killsScore(name),
			}))
			.sort((a, b) => a.value - b.value);
	}

	/** the score for the kills of a particular unit type */
	killsScore(unitTypeName: UnitTypeName): number {
		return this.kills[unitTypeName] * UnitTypes[unitTypeName].score;
	}

	/** total shots from the current round */
	get totalShots(): number {
		let total = 0;
		for (const name of WeaponTypeNames) {
			total += this.shots[name];
		}
		return total;
	}

	/** the score from the total shots from the current round */
	get totalShotsScore(): number {
		let total = 0;
		for (const name of WeaponTypeNames) {
			total += this.shotsScore(name);
		}
		return total;
	}

	/** get sorted kills row data for each unit type (skpping animal mele) */
	get shotsScoreRows(): Array<{ name: string; value: number; score: number }> {
		return WeaponTypeNames.filter(
			(name) => name !== WeaponTypes.animalMele.name,
		)
			.map((name) => ({
				name: name,
				value: this.shots[name],
				score: this.shotsScore(name),
			}))
			.sort((a, b) => a.value - b.value);
	}

	/** the score for the shots of a particular weapon type */
	shotsScore(weaponTypeName: WeaponTypeName): number {
		return this.shots[weaponTypeName] * WeaponTypes[weaponTypeName].score;
	}

	/** how long the round has lasted (in ms) */
	get duration(): number {
		return (this.end || Date.now()) - this._start;
	}

	get durationFormatted(): string {
		return formatTime(this.duration / 1000);
	}

	get durationScore(): number {
		return Math.floor(this.duration / 1000);
	}

	get totalScore(): number {
		return this.totalShotsScore + this.totalKillsScore + this.durationScore;
	}
}
