import type { Game } from "../game/game";
import type { GameScore } from "../game/game-score";
import { yeet } from "../utilities/utilities";
import {
	type UpgradableWeaponStat,
	UpgradableWeaponStats,
	type WeaponType,
	type WeaponTypeName,
	WeaponTypeNames,
	WeaponTypes,
	WeaponUpgradeTypes,
	upgradableWeaponStatLabel,
	weaponStatBase,
	weaponStatBasePctg,
	weaponStatSgmtPctg,
	weaponStatStacks,
	weaponStatUpgradedValue,
} from "../weapons/weapon";
import { elmById, elmBySelector } from "./score-overlay";

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
		private readonly _gameScore: GameScore,
	) {
		this._containerElm = elmById("scoreScreenContainer");
		this._titleElm = elmById("scoreScreenTitleContainer");
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

		this.hide(); // immediately hide
	}

	show(): void {
		this.updateTitleSection();
		this.updateScoreTab();
		this.updateUpgradesTab();
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

	private updateTitleSection(): void {
		const roundNoElm = elmBySelector("#scoreScreenTitleContainer .title-text");
		roundNoElm.textContent = `ROUND ${this._gameScore.roundScores.length}`;

		const pointsElm = elmBySelector(
			"#scoreScreenTitleContainer .spendable-points",
		);
		pointsElm.textContent = `POINTS: ${this._gameScore.spendablePoints}`;
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

		killsValueElm.innerText =
			this._gameScore.curRoundScore.totalKills.toString();
		killsScoreElm.innerText =
			this._gameScore.curRoundScore.totalKillsScore.toString();

		// add row for each unit type (skip prey)
		for (const rowData of this._gameScore.curRoundScore.killsScoreRows) {
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

		shotsValueElm.innerText =
			this._gameScore.curRoundScore.totalShots.toString();
		shotsScoreElm.innerText =
			this._gameScore.curRoundScore.totalShotsScore.toString();

		// add row for each unit type (skip prey)
		for (const rowData of this._gameScore.curRoundScore.shotsScoreRows) {
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

		durationValueElm.innerText =
			this._gameScore.curRoundScore.durationFormatted.toString();
		durationScoreElm.innerText =
			this._gameScore.curRoundScore.durationScore.toString();

		// total
		const totalTr = elmById("scoreTableTotal") as HTMLTableRowElement;
		const totalScoreElm = elmById("scoreTableTotalScore") as HTMLElement;

		totalScoreElm.innerText =
			this._gameScore.curRoundScore.totalScore.toString();
	}

	private updateUpgradesTab(): void {
		// build out table data models
		const weaponRows: WeaponRow[] = [];
		for (const weaponName of WeaponTypeNames) {
			if (weaponName === "animalMele") {
				continue;
			}

			const weaponRow: WeaponRow = {
				name: weaponName,
				unlocked: this._gameScore.unlockedWeapons[weaponName],
				statRows: [],
			};
			weaponRows.push(weaponRow);

			for (const stat of UpgradableWeaponStats) {
				const upgradedSgmts = this._gameScore.weaponUpgrades[weaponName][stat];
				const unUpgradedSgmts =
					weaponStatStacks(weaponName, stat) -
					this._gameScore.weaponUpgrades[weaponName][stat];
				const cost =
					WeaponUpgradeTypes[weaponName].find((ug) => ug.stat === stat)?.cost ??
					0;
				const statRow: WeaponStatRow = {
					name: stat,
					label: upgradableWeaponStatLabel(stat),
					cost,
					baseSgmtPctg: weaponStatBasePctg(weaponName, stat),
					upgradeSgmtPctg: weaponStatSgmtPctg(weaponName, stat),
					upgradedSgmts,
					unUpgradedSgmts,
					sgmtCount: 1 + upgradedSgmts + unUpgradedSgmts,
					baseIsInfinite: !Number.isFinite(weaponStatBase(weaponName, stat)),
					upgradeHandler: () => {
						this._gameScore.spendablePoints -= cost;
						this._gameScore.weaponUpgrades[weaponName][stat] += 1;
						this.updateUpgradesTab();
						this.updateTitleSection();
					},
					isMaxedOut:
						this._gameScore.weaponUpgrades[weaponName][stat] ===
						weaponStatStacks(weaponName, stat),
					canAfford: cost <= this._gameScore.spendablePoints,
				};
				weaponRow.statRows.push(statRow);
			}
		}

		// remove any existing generated elements
		const gridElm = document.querySelector("#weaponUpgradesGrid") ?? yeet();
		gridElm.innerHTML = "";

		// update document
		for (const wRow of weaponRows) {
			// weapon row
			gridElm.insertAdjacentHTML(
				"beforeend",
				`
				<div class="weapon-name">${wRow.name}</div>
				<div></div>
				<div></div>
			`,
			);

			// stat rows
			for (const sRow of wRow.statRows) {
				const statBarId = `${wRow.name}-${sRow.name}-stat-bar`;
				const statBtnId = `${wRow.name}-${sRow.name}-stat-btn`;
				gridElm.insertAdjacentHTML(
					"beforeend",
					`
					<div class="stat-name">${sRow.label}</div>
					<div id="${statBarId}" class="stat-bar">
					</div>
					<div id="${statBtnId}" class="stat-btn"></div>
				`,
				);

				// bind click handler for button
				const statBtn = elmById(statBtnId);
				const btnLabel = sRow.isMaxedOut ? "maxed out" : `-${sRow.cost}`;
				const disabled = sRow.isMaxedOut || !sRow.canAfford;
				statBtn.insertAdjacentHTML(
					"beforeend",
					`<button type="button"${disabled ? " disabled" : ""}>${btnLabel}</button>`,
				);
				if (!disabled) {
					statBtn.addEventListener("click", sRow.upgradeHandler);
				}

				// stat bar segments
				const statBarElm = elmById(statBarId);

				if (sRow.baseIsInfinite) {
					statBarElm.insertAdjacentHTML(
						"beforeend",
						`<div class="base-sgmt infinite" style="flex-basis: 100%;">&infin;</div>`,
					);
					continue;
				}

				const baseFlexBasis = `${Math.ceil(sRow.baseSgmtPctg * 100)}%`;
				const upgradeFlexBasis = `${Math.floor(sRow.upgradeSgmtPctg * 100)}%`;
				if (baseFlexBasis !== "0%") {
					statBarElm.insertAdjacentHTML(
						"beforeend",
						`<div class="base-sgmt" style="flex-basis: ${baseFlexBasis};"></div>`,
					);
				}

				for (let seg = 0; seg < sRow.sgmtCount - 1; seg++) {
					const segClass =
						seg < sRow.upgradedSgmts ? "upgraded-sgmt" : "unupgraded-sgmt";
					statBarElm.insertAdjacentHTML(
						"beforeend",
						`<div class="${segClass}" style="flex-basis: ${upgradeFlexBasis};"></div>`,
					);
				}
			}
		}
	}
}

interface WeaponRow {
	name: WeaponTypeName;
	unlocked: boolean;
	statRows: WeaponStatRow[];
}

interface WeaponStatRow {
	name: UpgradableWeaponStat;
	label: string;
	cost: number;
	baseSgmtPctg: number;
	upgradeSgmtPctg: number;
	upgradedSgmts: number;
	unUpgradedSgmts: number;
	sgmtCount: number;
	baseIsInfinite: boolean;
	upgradeHandler: () => void;
	isMaxedOut: boolean;
	canAfford: boolean;
}
