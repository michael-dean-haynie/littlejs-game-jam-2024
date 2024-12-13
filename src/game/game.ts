import {
	EngineObject,
	type Vector2,
	cameraPos,
	cameraScale,
	engineObjects,
	engineObjectsDestroy,
	setCameraPos,
	setCameraScale,
	setCanvasFixedSize,
	setObjectDefaultDamping,
	vec2,
} from "littlejsengine";
import { ActorDirectory } from "../actors/actor-directory";
import { EnemyActor } from "../actors/enemy-actor";
import { InputActor } from "../actors/input-actor";
import { PathingActor } from "../actors/pathing-actor";
import { PlayerActor } from "../actors/player-actor";
import { UnitActor } from "../actors/unit-actor";
import { WeaponActor } from "../actors/weapon-actor";
import { type TreeNoiseParams, WorldActor } from "../actors/world-actor";
import { MessageBroker } from "../messages/message-broker";
import { UI } from "../ui/ui";
import { yeet } from "../utilities/utilities";
import type { Score } from "./score";

export class Game {
	constructor() {
		this._canvasSize = vec2(1280, 720); // use a 720p fixed size canvas
		this._astarNodeSize = 1;

		setCanvasFixedSize(this._canvasSize);
		setCameraPos(vec2(0, 0));
		setObjectDefaultDamping(0.9);
		// setObjectDefaultFriction(0);
		// setObjectDefaultElasticity(1);

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
		this._scores = [];

		this._playerActor = null;
		this._enemyActor = null;

		this._worldActor.generateTrees();
		// setCameraScale(7);
	}

	/** buffer size of html <canvas> */
	private readonly _canvasSize: Vector2;
	/** size of each astar pathing cell/node (relative to world units) */
	private readonly _astarNodeSize: number;

	private readonly _actorDirectory: ActorDirectory;
	private readonly _messageBroker: MessageBroker;
	private readonly _ui: UI;
	private readonly _inputActor: InputActor;
	private readonly _scores: Score[];

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

	update(): void {
		this._inputActor.update(); // has special update() impl

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

	startRound() {
		// destroy actors
		this._actorDirectory.resetActors();

		// destroy any remaining engine objects
		engineObjectsDestroy();

		// re-create trees
		this._worldActor.generateTrees();

		// re-create player/enemy actors
		this._playerActor = new PlayerActor(
			this,
			this._actorDirectory,
			this._messageBroker,
		);
		this._enemyActor = new EnemyActor(
			this._actorDirectory,
			this._messageBroker,
		);
	}

	endRound(): void {
		// save score
		if (this._playerActor) {
			this._scores.push(this._playerActor.score);
		}

		// destroy actors
		this._actorDirectory.resetActors();
		this._playerActor = null;
		this._enemyActor = null;

		// destroy any remaining engine objects
		engineObjectsDestroy();
	}
}
