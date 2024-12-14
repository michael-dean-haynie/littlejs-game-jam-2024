import type { Game } from "../game/game";
import { Score } from "../game/score";
import { yeet } from "../utilities/utilities";
import { elmById } from "./score-overlay";

export class ScoreScreen {
	private readonly _containerElm: HTMLElement;
	private readonly _titleElm: HTMLElement;

	// tab content
	private readonly _scoreTabContentElm: HTMLElement;
	private readonly _achievementsTabContentElm: HTMLElement;
	private readonly _upgradesTabContentElm: HTMLElement;

	// tab buttons
	private readonly _scoreTabBtnElm: HTMLButtonElement;
	private readonly _achievementsTabBtnElm: HTMLButtonElement;
	private readonly _upgradesTabBtnElm: HTMLButtonElement;
	private readonly _startBtnElm: HTMLButtonElement;

	private readonly _resizeObserver: ResizeObserver;

	constructor(
		private readonly _game: Game,
		private readonly _scores: Score[],
	) {
		// TODO: remove hardcoded score for testing ui
		// this._scores = [];
		// this._scores.push(new Score());
		// this.curScore.kills.rabbit = 23;
		// this.curScore.kills.pig = 4;
		// this.curScore.shots.bat = 14;
		// this.curScore.shots.pistol = 44;
		// this.curScore.shots.shotgun = 20;

		this._containerElm = elmById("scoreScreenContainer");
		this._titleElm = elmById("scoreScreenTitle");
		this.hide(); // immediately hide
		this._resizeObserver = new ResizeObserver((entries, observer) => {
			for (const entry of entries) {
				if (entry.target instanceof HTMLCanvasElement) {
					const { blockSize, inlineSize } = entry.contentBoxSize[0];
					const ctnrWidth = inlineSize * 0.8;
					const ctnrHeight = blockSize * 0.8;
					this._containerElm.style.height = `${ctnrHeight}px`;
					this._containerElm.style.width = `${ctnrWidth}px`;
					this._containerElm.style.fontSize = `${inlineSize / 75}px`;
				}
			}
		});
		const canvasElm = document.querySelector("canvas") ?? yeet();
		this._resizeObserver.observe(canvasElm);

		// tab content
		this._scoreTabContentElm = elmById("scoreTabContent") as HTMLElement;
		this._achievementsTabContentElm = elmById(
			"achievementsTabContent",
		) as HTMLElement;
		this._upgradesTabContentElm = elmById("upgradesTabContent") as HTMLElement;

		// tab buttons
		this._scoreTabBtnElm = elmById("scoreTabBtn") as HTMLButtonElement;
		this._achievementsTabBtnElm = elmById(
			"achievementsTabBtn",
		) as HTMLButtonElement;
		this._upgradesTabBtnElm = elmById("upgradesTabBtn") as HTMLButtonElement;
		this._startBtnElm = elmById("startBtn") as HTMLButtonElement;

		// tab button click listeners
		this._scoreTabBtnElm.addEventListener("click", () =>
			this.switchToTab(this._scoreTabBtnElm, this._scoreTabContentElm),
		);
		this._achievementsTabBtnElm.addEventListener("click", () =>
			this.switchToTab(
				this._achievementsTabBtnElm,
				this._achievementsTabContentElm,
			),
		);
		this._upgradesTabBtnElm.addEventListener("click", () =>
			this.switchToTab(this._upgradesTabBtnElm, this._upgradesTabContentElm),
		);
		this._startBtnElm.addEventListener("click", () => {
			return this._game.startRound();
		});
	}

	show(): void {
		this._titleElm.textContent = `ROUND ${this._scores.length}`;
		this.updateScoreTab();
		this._scoreTabBtnElm.click(); // select score tab, initially

		this._containerElm.classList.remove("hidden");
	}

	hide(): void {
		this._containerElm.classList.add("hidden");
	}

	toggle(): void {
		if (this._containerElm.classList.contains("hidden")) {
			this.show();
		} else {
			this.hide();
		}
	}

	private switchToTab(
		tabBtnElm: HTMLButtonElement,
		tabContentElm: HTMLElement,
	) {
		// enable all tab buttons
		for (const tabBtn of [
			this._scoreTabBtnElm,
			this._achievementsTabBtnElm,
			this._upgradesTabBtnElm,
		]) {
			tabBtn.disabled = false;
		}

		// disable this tab
		tabBtnElm.disabled = true;

		// hide all tab content
		for (const tabContent of [
			this._scoreTabContentElm,
			this._achievementsTabContentElm,
			this._upgradesTabContentElm,
		]) {
			tabContent.classList.add("hidden");
		}

		// show content
		tabContentElm.classList.remove("hidden");
	}

	private updateScoreTab(): void {
		// remove all generated rows
		for (const genRow of document.querySelectorAll("#scoreTable .gen-row")) {
			genRow.remove();
		}

		// kills
		const killsTr = elmById("scoreTableKills") as HTMLTableRowElement;
		const killsValueElm = elmById("scoreTableKillsValue") as HTMLElement;
		const killsScoreElm = elmById("scoreTableKillsScore") as HTMLElement;

		killsValueElm.innerText = this.curScore.totalKills.toString();
		killsScoreElm.innerText = this.curScore.totalKillsScore.toString();

		// add row for each unit type (skip prey)
		for (const rowData of this.curScore.killsScoreRows) {
			const rowHtml = `
			<tr class="gen-row">
				<td class="ind-1">${rowData.name}</td>
				<td class="value">
					<span class="tiny">x</span>
					<span>${rowData.value}</span>
					<span class="tiny">=</span>
				</td>
				<td class="score">${rowData.score}</td>
			</tr>`;
			killsTr.insertAdjacentHTML("afterend", rowHtml);
		}

		// shots
		const shotsTr = elmById("scoreTableShots") as HTMLTableRowElement;
		const shotsValueElm = elmById("scoreTableShotsValue") as HTMLElement;
		const shotsScoreElm = elmById("scoreTableShotsScore") as HTMLElement;

		shotsValueElm.innerText = this.curScore.totalShots.toString();
		shotsScoreElm.innerText = this.curScore.totalShotsScore.toString();

		// add row for each unit type (skip prey)
		for (const rowData of this.curScore.shotsScoreRows) {
			const rowHtml = `
			<tr class="gen-row">
				<td class="ind-1">${rowData.name}</td>
				<td class="value">
					<span class="tiny">x</span>
					<span>${rowData.value}</span>
					<span class="tiny">=</span>
				</td>
				<td class="score">${rowData.score}</td>
			</tr>`;
			shotsTr.insertAdjacentHTML("afterend", rowHtml);
		}

		// achievements
		// TODO: fill this in

		// duration
		const durationTr = elmById("scoreTableDuration") as HTMLTableRowElement;
		const durationValueElm = elmById("scoreTableDurationValue") as HTMLElement;
		const durationScoreElm = elmById("scoreTableDurationScore") as HTMLElement;

		durationValueElm.innerText = this.curScore.durationFormatted.toString();
		durationScoreElm.innerText = this.curScore.durationScore.toString();

		// total
		const totalTr = elmById("scoreTableTotal") as HTMLTableRowElement;
		const totalScoreElm = elmById("scoreTableTotalScore") as HTMLElement;

		totalScoreElm.innerText = this.curScore.totalScore.toString();
	}

	/** get the score for the latest round, or a blank score if no rounds exist yet */
	private get curScore(): Score {
		return this._scores.at(-1) || new Score();
	}
}
