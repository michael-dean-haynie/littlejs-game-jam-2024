import { Score } from "../game/score";
import { yeet } from "../utilities/utilities";

export class ScoreOverlay {
	private readonly _overlayElm: HTMLElement;
	private readonly _scoreElm: HTMLElement;
	private readonly _resizeObserver: ResizeObserver;

	constructor(private readonly _scores: Score[]) {
		this._overlayElm = elmById("overlayContainer");
		this._scoreElm = elmById("score");

		this._resizeObserver = new ResizeObserver((entries, observer) => {
			for (const entry of entries) {
				if (entry.target instanceof HTMLCanvasElement) {
					const { blockSize, inlineSize } = entry.contentBoxSize[0];
					this._overlayElm.style.height = `${blockSize}px`;
					this._overlayElm.style.width = `${inlineSize}px`;
				}
			}
		});
		const canvasElm = document.querySelector("canvas") ?? yeet();
		this._resizeObserver.observe(canvasElm);
	}

	update() {
		this._scoreElm.textContent = this.currentScore.totalKills.toString();
	}

	/** get the score for the latest round, or a blank score if no rounds exist yet */
	get currentScore(): Score {
		return this._scores.at(0) || new Score();
	}
}

export function elmById(id: string): HTMLElement {
	return document.getElementById(id) ?? yeet();
}
