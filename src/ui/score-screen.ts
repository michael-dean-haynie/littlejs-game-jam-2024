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
	private readonly _weaponsTabContentElm: HTMLElement;

	// tab buttons
	private readonly _scoreTabBtnElm: HTMLButtonElement;
	private readonly _achievementsTabBtnElm: HTMLButtonElement;
	private readonly _weaponsTabBtnElm: HTMLButtonElement;
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
		this._weaponsTabContentElm = elmById("weaponsTabContent") as HTMLElement;

		// tab buttons
		this._scoreTabBtnElm = elmById("scoreTabBtn") as HTMLButtonElement;
		this._achievementsTabBtnElm = elmById(
			"achievementsTabBtn",
		) as HTMLButtonElement;
		this._weaponsTabBtnElm = elmById("weaponsTabBtn") as HTMLButtonElement;
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
		this._weaponsTabBtnElm.addEventListener("click", () =>
			this.switchToTab(this._weaponsTabBtnElm, this._weaponsTabContentElm),
		);
		this._startBtnElm.addEventListener("click", () => {
			return this._game.startRound();
		});

		this.hide(); // immediately hide
	}

	show(): void {
		this.updateTitleSection();
		this.updateScoreTab();
		this.updateWeaponsTab();
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
			this._weaponsTabBtnElm,
		]) {
			tabBtn.disabled = false;
		}

		// disable this tab
		tabBtnElm.disabled = true;

		// hide all tab content
		for (const tabContent of [
			this._scoreTabContentElm,
			this._achievementsTabContentElm,
			this._weaponsTabContentElm,
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

	private updateWeaponsTab(): void {
		this.updateWeaponSlots();
		this.updateWeaponUpgradesGrid();
	}

	private updateWeaponSlots(): void {
		const weaponSlot1Elm = elmById("weaponSlot1") as HTMLSelectElement;
		const weaponSlot2Elm = elmById("weaponSlot2") as HTMLSelectElement;

		// clear out any generated elements
		weaponSlot1Elm.innerHTML = "";
		weaponSlot2Elm.innerHTML = "";

		// disable second slot if there is only 1 unlocked weapon
		const secondSlotEnabled =
			Object.entries(this._gameScore.unlockedWeapons).filter(([key, value]) => {
				return value;
			}).length > 1;

		if (secondSlotEnabled) {
			weaponSlot2Elm.removeAttribute("disabled");
		} else {
			weaponSlot2Elm.setAttribute("disabled", "");
		}

		const weapons = WeaponTypeNames.filter((wn) => wn !== "animalMele");
		const slots = this._gameScore.weaponSlots;
		for (const weaponName of weapons) {
			const unlocked = this._gameScore.unlockedWeapons[weaponName];
			weaponSlot1Elm.insertAdjacentHTML(
				"beforeend",
				`<option
					value="${weaponName}"
					${unlocked ? "" : " disabled"}
					${slots[0] === weaponName ? " selected" : ""}
				>${weaponName}</option>`,
			);

			if (secondSlotEnabled) {
				weaponSlot2Elm.insertAdjacentHTML(
					"beforeend",
					`<option
						value="${weaponName}"
						${unlocked ? "" : " disabled"}
						${slots[1] === weaponName ? " selected" : ""}
					>${weaponName}</option>`,
				);
			}
		}

		// bind event listeners
		weaponSlot1Elm.addEventListener("change", () => {
			const swapSlots = weaponSlot1Elm.value === this._gameScore.weaponSlots[1];
			if (swapSlots) {
				this._gameScore.weaponSlots[1] = this._gameScore.weaponSlots[0];
			}
			this._gameScore.weaponSlots[0] = weaponSlot1Elm.value as WeaponTypeName;
			this.updateWeaponSlots();
		});
		weaponSlot2Elm.addEventListener("change", () => {
			const swapSlots = weaponSlot2Elm.value === this._gameScore.weaponSlots[0];
			if (swapSlots) {
				this._gameScore.weaponSlots[0] = this._gameScore.weaponSlots[1];
			}
			this._gameScore.weaponSlots[1] = weaponSlot2Elm.value as WeaponTypeName;
			this.updateWeaponSlots();
		});
	}

	private updateWeaponUpgradesGrid(): void {
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
				cost: WeaponTypes[weaponName].cost,
				canAfford:
					WeaponTypes[weaponName].cost <= this._gameScore.spendablePoints,
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
						this.updateWeaponsTab();
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
			const weaponBtnId = `${wRow.name}-weapon-btn`;
			gridElm.insertAdjacentHTML(
				"beforeend",
				`
				<div class="weapon-name${wRow.unlocked ? "" : " locked"}">${wRow.name}</div>
				<div></div>
				<div id="${weaponBtnId}" class="weapon-btn"></div>
			`,
			);
			const weaponBtn = elmById(weaponBtnId);
			if (!wRow.unlocked) {
				weaponBtn.insertAdjacentHTML(
					"beforeend",
					`<button${wRow.canAfford ? "" : " disabled"}>-${wRow.cost}</button>`,
				);
				weaponBtn.addEventListener("click", () => {
					this._gameScore.spendablePoints -= wRow.cost;
					this._gameScore.unlockedWeapons[wRow.name] = true;
					if (this._gameScore.weaponSlots[1] === null) {
						this._gameScore.weaponSlots[1] = wRow.name;
					}
					this.updateWeaponSlots();
					this.updateWeaponUpgradesGrid();
				});
			}

			// stat rows
			for (const sRow of wRow.statRows) {
				const statBarId = `${wRow.name}-${sRow.name}-stat-bar`;
				const statBtnId = `${wRow.name}-${sRow.name}-stat-btn`;
				gridElm.insertAdjacentHTML(
					"beforeend",
					`
					<div class="stat-name${wRow.unlocked ? "" : " locked"}">${sRow.label}</div>
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
						`<div class="base-sgmt${wRow.unlocked ? "" : " locked"}" style="flex-basis: ${baseFlexBasis};"></div>`,
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
	cost: number;
	canAfford: boolean;
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
