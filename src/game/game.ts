import {
	type Vector2,
	cameraScale,
	drawLine,
	engineObjectsDestroy,
	getCameraSize,
	rgb,
	setCameraPos,
	setCanvasFixedSize,
	setObjectDefaultDamping,
	setShowWatermark,
	vec2,
} from "littlejsengine";
import { ActorDirectory } from "../actors/actor-directory";
import { EnemyActor } from "../actors/enemy-actor";
import { InputActor } from "../actors/input-actor";
import { PathingActor } from "../actors/pathing-actor";
import { PlayerActor } from "../actors/player-actor";
import { UnitActor } from "../actors/unit-actor";
import { WeaponActor } from "../actors/weapon-actor";
import { WorldActor } from "../actors/world-actor";
import { MessageBroker } from "../messages/message-broker";
import { IntroScreen } from "../ui/intro-screen";
import { ScoreOverlay } from "../ui/score-overlay";
import { ScoreScreen } from "../ui/score-screen";
import { UI } from "../ui/ui";
import { yeet } from "../utilities/utilities";
import { GameScore } from "./game-score";
import { RoundScore } from "./round-score";

export class Game {
	/** buffer size of html <canvas> */
	private readonly _canvasSize: Vector2;
	/** size of each astar pathing cell/node (relative to world units) */
	private readonly _astarNodeSize: number;

	private readonly _actorDirectory: ActorDirectory;
	private readonly _messageBroker: MessageBroker;
	private readonly _ui: UI;
	private readonly _scoreOverlay: ScoreOverlay;
	private readonly _scoreScreen: ScoreScreen;
	private readonly _introScreen: IntroScreen;
	private readonly _inputActor: InputActor;
	/** score data from each completed round */
	private readonly _gameScore: GameScore;

	private readonly _worldActor: WorldActor;
	get worldActor(): WorldActor {
		return this._worldActor;
	}

	private readonly _pathingActor: PathingActor;
	get pathingActor(): PathingActor {
		return this._pathingActor;
	}

	private _playerActor: PlayerActor | null;
	get playerActor(): PlayerActor {
		return this._playerActor ?? yeet();
	}

	private _enemyActor: EnemyActor | null;
	public get enemyActor(): EnemyActor {
		return this._enemyActor ?? yeet();
	}

	constructor() {
		/** hardcoded to match css rule 'aspect-ratio' on #overlayContainer */
		this._canvasSize = vec2(1280, 720); // use a 720p fixed size canvas
		this._astarNodeSize = 1;

		setCanvasFixedSize(this._canvasSize);
		setCameraPos(vec2(0, 0));
		setObjectDefaultDamping(0.9);
		// setObjectDefaultFriction(0);
		// setObjectDefaultElasticity(1);
		// setCameraScale(7);
		setShowWatermark(false);

		this._actorDirectory = new ActorDirectory();
		this._messageBroker = new MessageBroker(this._actorDirectory);
		this._worldActor = new WorldActor(
			this,
			this._actorDirectory,
			this._messageBroker,
		);
		this._pathingActor = new PathingActor(
			this._worldActor,
			this._actorDirectory,
			this._messageBroker,
		);
		this._ui = new UI(this);
		this._inputActor = new InputActor(
			this._ui,
			this._actorDirectory,
			this._messageBroker,
		);
		this._gameScore = new GameScore();
		this._scoreOverlay = new ScoreOverlay(
			this._actorDirectory,
			this._gameScore,
		);
		this._scoreScreen = new ScoreScreen(this, this._gameScore);
		this._introScreen = new IntroScreen(this);

		this._playerActor = null;
		this._enemyActor = null;

		this._worldActor.generateTrees();
	}

	update(): void {
		this._inputActor.update(); // has special update() impl
		this._scoreOverlay.update();

		this._worldActor.update();
		// update player/enemy
		if (this._playerActor) {
			this.playerActor.update();
		}
		if (this._enemyActor) {
			this.enemyActor.update();
		}
		// pathingActor doesn't receive any messages

		// update units
		for (const actor of this._actorDirectory.actors) {
			if (actor instanceof UnitActor) {
				actor.update();
			}
		}

		// update weapons
		for (const actor of this._actorDirectory.actors) {
			if (actor instanceof WeaponActor) {
				actor.update();
			}
		}
	}

	render(): void {}

	renderPost(): void {
		// draw border (origin in top right)
		const thick = 4;
		const width = getCameraSize().x * cameraScale - thick / 2;
		const height = getCameraSize().y * cameraScale - thick / 2;

		// top
		drawLine(
			vec2(0, 0),
			vec2(width, 0),
			thick,
			rgb(1, 1, 1, 1),
			undefined,
			true,
		);

		// left
		drawLine(
			vec2(0, 0),
			vec2(0, height),
			thick,
			rgb(1, 1, 1, 1),
			undefined,
			true,
		);

		// bottom
		drawLine(
			vec2(0, height),
			vec2(width, height),
			thick,
			rgb(1, 1, 1, 1),
			undefined,
			true,
		);

		// bottom
		drawLine(
			vec2(width, 0),
			vec2(width, height),
			thick,
			rgb(1, 1, 1, 1),
			undefined,
			true,
		);
	}

	startRound() {
		this._scoreScreen.hide();
		this._scoreOverlay.show();

		// destroy actors
		this._actorDirectory.resetActors();

		// destroy any remaining engine objects
		engineObjectsDestroy();

		// re-create trees
		this._worldActor.generateTrees();

		// re-create player/enemy actors
		this._gameScore.roundScores.push(new RoundScore());
		this._playerActor = new PlayerActor(
			this,
			this._gameScore,
			this._actorDirectory,
			this._messageBroker,
		);
		this._enemyActor = new EnemyActor(
			this,
			this._gameScore,
			this._actorDirectory,
			this._messageBroker,
		);
	}

	endRound(): void {
		// update score for this round
		this._gameScore.curRoundScore.end = Date.now();
		this._gameScore.spendablePoints += this._gameScore.curRoundScore.totalScore;
		this._scoreScreen.show();
		this._scoreOverlay.hide();

		// destroy actors
		this._actorDirectory.resetActors();
		this._playerActor = null;
		this._enemyActor = null;

		// destroy any remaining engine objects
		engineObjectsDestroy();

		// re-seed noise for next round
		this._worldActor.seed = Math.random();
	}
}
function rbg(
	arg0: number,
	arg1: number,
	arg2: number,
	arg3: number,
): number | undefined {
	throw new Error("Function not implemented.");
}
