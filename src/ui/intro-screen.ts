import type { Game } from "../game/game";
import { Score } from "../game/score";
import { yeet } from "../utilities/utilities";
import { elmById } from "./score-overlay";

export class IntroScreen {
	private readonly _containerElm: HTMLElement;
	private readonly introTextElm: HTMLElement;
	// private readonly _introButtonElm: HTMLButtonElement;

	// private readonly _resizeObserver: ResizeObserver;

	private currentStep: number;
	private steps: string[];

	constructor(private readonly _game: Game) {
		this._containerElm = elmById("introScreenContainer");
		this.toggle(); // immediately hide
		this.toggle(); // immediately show again

		// this._resizeObserver = new ResizeObserver((entries, observer) => {
		// 	for (const entry of entries) {
		// 		if (entry.target instanceof HTMLCanvasElement) {
		// 			const { blockSize, inlineSize } = entry.contentBoxSize[0];
		// 			const ctnrWidth = inlineSize * 1;
		// 			const ctnrHeight = blockSize * 1;
		// 			this._containerElm.style.height = `${ctnrHeight}px`;
		// 			this._containerElm.style.width = `${ctnrWidth}px`;
		// 			this._containerElm.style.fontSize = `${inlineSize / 100}px`;
		// 		}
		// 	}
		// });
		// const canvasElm = document.querySelector("canvas") ?? yeet();
		// this._resizeObserver.observe(canvasElm);

		// start button
		// this._introButtonElm = elmById("introBtn") as HTMLButtonElement;
		// this._introButtonElm.addEventListener("click", () => {
		this._containerElm.addEventListener("click", () => {
			this.currentStep++;
			if (this.currentStep < this.steps.length) {
				this.introTextElm.textContent = this.steps[this.currentStep];
			} else {
				this.toggle();
				this._game.startRound();
			}
		});

		this.steps = [
			"you've been captured by a gang of wild animals ...",
			"every day they set you free - just to hunt you down again ...",
			"will it ever end?",
		];
		this.currentStep = 0;
		this.introTextElm = elmById("introText");
		this.introTextElm.textContent = this.steps[0];
	}

	toggle(): void {
		this._containerElm.classList.toggle("hidden");
	}
}
