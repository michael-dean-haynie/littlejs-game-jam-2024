import type { TreeNoiseParams } from "../actors/world-actor";
import type { Game } from "../game/game";
import { yeet } from "../utilities/utilities";

export class UI {
	constructor(private readonly _game: Game) {
		this._noiseTypeInput = (document.getElementById("noiseType") ??
			yeet()) as HTMLInputElement;
		this._thresholdInput = (document.getElementById("threshold") ??
			yeet()) as HTMLInputElement;
		this._scaleInput = (document.getElementById("scale") ??
			yeet()) as HTMLInputElement;
		this._octavesInput = (document.getElementById("octaves") ??
			yeet()) as HTMLInputElement;
		this._persistanceInput = (document.getElementById("persistance") ??
			yeet()) as HTMLInputElement;
		this._lacunarityInput = (document.getElementById("lacunarity") ??
			yeet()) as HTMLInputElement;

		this._plainNoiseFormGroup = (document.getElementById(
			"plainNoiseFormGroup",
		) ?? yeet()) as HTMLElement;
		this._simplexNoiseFormGroup = (document.getElementById(
			"simplexNoiseFormGroup",
		) ?? yeet()) as HTMLElement;

		this._seedButton = (document.getElementById("seed") ??
			yeet()) as HTMLElement;
		this._playTestNoiseButton = (document.getElementById("playTestNoise") ??
			yeet()) as HTMLElement;
		this._stopPlayTestNoiseButton = (document.getElementById(
			"stopPlayTestNoise",
		) ?? yeet()) as HTMLElement;

		this.initUI();
		// this.generateTrees(); // initial call
	}

	private _noiseTypeInput: HTMLInputElement;
	private _thresholdInput: HTMLInputElement;
	private _scaleInput: HTMLInputElement;
	private _octavesInput: HTMLInputElement;
	private _persistanceInput: HTMLInputElement;
	private _lacunarityInput: HTMLInputElement;

	private _plainNoiseFormGroup: HTMLElement;
	private _simplexNoiseFormGroup: HTMLElement;

	private _seedButton: HTMLElement;
	private _playTestNoiseButton: HTMLElement;
	private _stopPlayTestNoiseButton: HTMLElement;

	toggleUI() {
		const uiDiv = document.getElementById("uiContainer") ?? yeet();

		uiDiv.classList.toggle("hidden");
	}

	private initUI() {
		// bind inputs
		this._seedButton.addEventListener("click", (event) => {
			this._game.worldActor.seed = Math.random();
			this.generateTrees();
		});

		this._playTestNoiseButton.addEventListener("click", (event) => {
			this.toggleUI();
			this._game.startRound();
		});

		this._stopPlayTestNoiseButton.addEventListener("click", (event) => {
			this._game.endRound();
			this.generateTrees();
		});

		this._noiseTypeInput.addEventListener("input", (event) => {
			const noiseType = this.getNoiseType();
			if (noiseType === "plain") {
				this._plainNoiseFormGroup.classList.remove("hidden");
				this._simplexNoiseFormGroup.classList.add("hidden");
			} else if (noiseType === "simplex") {
				this._plainNoiseFormGroup.classList.add("hidden");
				this._simplexNoiseFormGroup.classList.remove("hidden");
			}
			this.generateTrees();
		});

		this._thresholdInput.value = "-0.8";
		this._thresholdInput.addEventListener("input", (event) =>
			this.generateTrees(),
		);

		this._scaleInput.value = "25";
		this._scaleInput.addEventListener("input", (event) => this.generateTrees());

		this._octavesInput.value = "4";
		this._octavesInput.addEventListener("input", (event) =>
			this.generateTrees(),
		);

		this._persistanceInput.value = "0.8";
		this._persistanceInput.addEventListener("input", (event) =>
			this.generateTrees(),
		);

		this._lacunarityInput.value = "2";
		this._lacunarityInput.addEventListener("input", (event) =>
			this.generateTrees(),
		);
	}

	private getNoiseType(): "plain" | "simplex" {
		return this._noiseTypeInput.value as "plain" | "simplex";
	}

	private getTreeNoiseParams(): TreeNoiseParams {
		return {
			noiseType: this.getNoiseType(),
			threshold: Number(this._thresholdInput.value),
			scale: Number(this._scaleInput.value),
			octaves: Number(this._octavesInput.value),
			persistance: Number(this._persistanceInput.value),
			lacunarity: Number(this._lacunarityInput.value),
		};
	}

	private generateTrees() {
		this._game.worldActor.treeNoiseParams = this.getTreeNoiseParams();
		this._game.worldActor.generateTrees();
	}
}
