import { formatTime } from "littlejsengine";
import { Score } from "../game/score";
import { yeet } from "../utilities/utilities";

export class ScoreOverlay {
	private readonly _overlayElm: HTMLElement;
	private readonly _scoreElm: HTMLElement;
	private readonly _roundElm: HTMLElement;
	private readonly _durationElm: HTMLElement;
	private readonly _resizeObserver: ResizeObserver;

	constructor(private readonly _scores: Score[]) {
		this._overlayElm = elmById("overlayContainer");
		this._scoreElm = elmById("score");
		this._roundElm = elmById("round");
		this._durationElm = elmById("duration");

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
	}

	update() {
		this._scoreElm.textContent = this.currentScore.totalScore.toString();
		this._roundElm.textContent = this.currentRound.toString();
		this._durationElm.textContent = this.currentScore.durationFormatted;
	}

	/** get the score for the latest round, or a blank score if no rounds exist yet */
	get currentScore(): Score {
		return this._scores.at(-1) || new Score();
	}

	/** the current round */
	get currentRound(): number {
		return this._scores.length;
	}
}

export function elmById(id: string): HTMLElement {
	return document.getElementById(id) ?? yeet();
}
