import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import { WeaponActor } from "../actors/weapon-actor";
import type { GameScore } from "../game/game-score";
import { yeet } from "../utilities/utilities";

export class ScoreOverlay {
	private readonly _overlayElm: HTMLElement;
	private readonly _scoreElm: HTMLElement;
	private readonly _roundElm: HTMLElement;
	private readonly _durationElm: HTMLElement;
	private readonly _weaponElm: HTMLElement;
	private readonly _resizeObserver: ResizeObserver;

	constructor(
		private readonly _actorDirectory: ActorDirectory,
		private readonly _gameScore: GameScore,
	) {
		this._overlayElm = elmById("overlayContainer");
		this._scoreElm = elmById("score");
		this._roundElm = elmById("round");
		this._durationElm = elmById("duration");
		this._weaponElm = elmById("weapon");

		this._resizeObserver = new ResizeObserver((entries, observer) => {
			for (const entry of entries) {
				if (entry.target instanceof HTMLCanvasElement) {
					const { blockSize, inlineSize } = entry.contentBoxSize[0];
					this._overlayElm.style.height = `${blockSize}px`;
					this._overlayElm.style.width = `${inlineSize}px`;
					this._overlayElm.style.fontSize = `${inlineSize / 100}px`;
				}
			}
		});
		const canvasElm = document.querySelector("canvas") ?? yeet();
		this._resizeObserver.observe(canvasElm);

		this.hide();
	}

	update() {
		if (this._overlayElm.classList.contains("hidden")) {
			return; // don't update when hidden
		}

		this._scoreElm.textContent =
			this._gameScore.curRoundScore.totalScore.toString();

		this._roundElm.textContent = this.currentRound.toString();

		this._durationElm.textContent =
			this._gameScore.curRoundScore.durationFormatted;

		let weaponText = "";
		const playerUnitActor = this._actorDirectory.getActorByAlias(
			"playerUnitActor",
			UnitActor,
		);
		if (playerUnitActor?.equippedWeaponActorId) {
			const weaponActor = this._actorDirectory.getActor(
				playerUnitActor.equippedWeaponActorId,
				WeaponActor,
			);
			if (weaponActor) {
				weaponText = weaponActor.weaponType.name;
			}
		}
		this._weaponElm.textContent = weaponText;
	}

	show(): void {
		this.update();
		this._overlayElm.classList.remove("hidden");
	}

	hide(): void {
		this._overlayElm.classList.add("hidden");
	}

	toggle(): void {
		if (this._overlayElm.classList.contains("hidden")) {
			this.show();
		} else {
			this.hide();
		}
	}

	/** the current round */
	get currentRound(): number {
		return this._gameScore.roundScores.length;
	}
}

export function elmById(id: string): HTMLElement {
	return document.getElementById(id) ?? yeet();
}

export function elmBySelector(selector: string): HTMLElement {
	return document.querySelector(selector) ?? yeet();
}
