import type { PathingActor } from "../actors/pathing-actor";
import { yeet } from "../utilities/utilities";

export class UI {
	constructor(private readonly _pathingActor: PathingActor) {
		this._noiseTypeInput = (document.getElementById("noiseType") ??
			yeet("UNEXPECTED_NULLISH_VALUE")) as HTMLInputElement;
		this._thresholdInput = (document.getElementById("threshold") ??
			yeet("UNEXPECTED_NULLISH_VALUE")) as HTMLInputElement;
		this._scaleInput = (document.getElementById("scale") ??
			yeet("UNEXPECTED_NULLISH_VALUE")) as HTMLInputElement;
		this._octavesInput = (document.getElementById("octaves") ??
			yeet("UNEXPECTED_NULLISH_VALUE")) as HTMLInputElement;
		this._persistanceInput = (document.getElementById("persistance") ??
			yeet("UNEXPECTED_NULLISH_VALUE")) as HTMLInputElement;
		this._lacunarityInput = (document.getElementById("lacunarity") ??
			yeet("UNEXPECTED_NULLISH_VALUE")) as HTMLInputElement;

		this._plainNoiseFormGroup = (document.getElementById(
			"plainNoiseFormGroup",
		) ?? yeet("UNEXPECTED_NULLISH_VALUE")) as HTMLElement;
		this._simplexNoiseFormGroup = (document.getElementById(
			"simplexNoiseFormGroup",
		) ?? yeet("UNEXPECTED_NULLISH_VALUE")) as HTMLElement;

		this._seedButton = (document.getElementById("seed") ??
			yeet("UNEXPECTED_NULLISH_VALUE")) as HTMLElement;

		this.initUI();
		this.generateTrees(); // initial call
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

	toggleUI() {
		const uiDiv =
			document.getElementById("ui-container") ??
			yeet("UNEXPECTED_NULLISH_VALUE");

		uiDiv.classList.toggle("hidden");
	}

	private initUI() {
		// bind inputs
		this._seedButton.addEventListener("click", (event) => {
			this._pathingActor.seed = Math.random();
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

		this._thresholdInput.value = "-0.5";
		this._thresholdInput.addEventListener("input", (event) =>
			this.generateTrees(),
		);

		this._scaleInput.value = "1";
		this._scaleInput.addEventListener("input", (event) => this.generateTrees());

		this._octavesInput.value = "4";
		this._octavesInput.addEventListener("input", (event) =>
			this.generateTrees(),
		);

		this._persistanceInput.value = "0.5";
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

	private generateTrees() {
		const noiseType = this.getNoiseType();
		if (noiseType === "plain") {
			this.generateTreesPlain();
		} else if (noiseType === "simplex") {
			this.generateTreesSimplex();
		}
	}

	private generateTreesPlain() {
		this._pathingActor.generateTreesPlain(Number(this._thresholdInput.value));
	}

	private generateTreesSimplex() {
		this._pathingActor.generateTreesSimplex(
			Number(this._thresholdInput.value),
			Number(this._scaleInput.value),
			Number(this._octavesInput.value),
			Number(this._persistanceInput.value),
			Number(this._lacunarityInput.value),
		);
	}
}
