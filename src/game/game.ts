import {
	type Vector2,
	cameraScale,
	engineObjectsDestroy,
	setCameraPos,
	setCanvasFixedSize,
	setObjectDefaultDamping,
	vec2,
} from "littlejsengine";
import { ActorDirectory } from "../actors/actor-directory";
import { EnemyActor } from "../actors/enemy-actor";
import { InputActor } from "../actors/input-actor";
import { PathingActor, type TreeNoiseParams } from "../actors/pathing-actor";
import { PlayerActor } from "../actors/player-actor";
import { UnitActor } from "../actors/unit-actor";
import { WeaponActor } from "../actors/weapon-actor";
import { MessageBroker } from "../messages/message-broker";
import { UI } from "../ui/ui";
import { yeet } from "../utilities/utilities";

export class Game {
	constructor() {
		this._canvasSize = vec2(1280, 720); // use a 720p fixed size canvas
		this._astarNodeSize = 1;
		this._arenaSize = this._canvasSize.divide(vec2(cameraScale));
		this._spawnAreaSize = 5;

		const worldSizeX = Math.ceil(this._arenaSize.x + this._spawnAreaSize * 2);
		const worldSizeY = Math.ceil(this._arenaSize.y + this._spawnAreaSize * 2);
		this._worldSize = vec2(worldSizeX, worldSizeY);
		this._worldCenter = this._worldSize.scale(0.5);

		setCanvasFixedSize(this._canvasSize);
		setCameraPos(this._worldCenter);
		setObjectDefaultDamping(0.9);
		// setObjectDefaultFriction(0);
		// setObjectDefaultElasticity(1);

		this._actorDirectory = new ActorDirectory();
		this._messageBroker = new MessageBroker(this._actorDirectory);
		this._pathingActor = this.createPathingActor();
		this._ui = new UI(this);
		this._inputActor = new InputActor(
			this._ui,
			this._actorDirectory,
			this._messageBroker,
		);

		this._playerActor = null;
		this._enemyActor = null;

		// this.startRound({
		// 	noiseType: "plain",
		// 	threshold: -0.8,
		// });
		// this._pathingActor.generateTrees({
		// 	noiseType: "plain",
		// 	threshold: -0.8,
		// });
		this._pathingActor.generateTrees({
			noiseType: "simplex",
			threshold: -0.8,
			scale: 25,
			octaves: 4,
			persistance: 0.8,
			lacunarity: 2,
		});
	}

	/** buffer size of html <canvas> */
	private readonly _canvasSize: Vector2;
	/** size of each astar pathing cell/node (relative to world units) */
	private readonly _astarNodeSize: number;
	/** size of the arena where the player unit can move (in world units) */
	private readonly _arenaSize: Vector2;
	/** size of the enemy spawn areas surrounding the arena (in world unit)*/
	private readonly _spawnAreaSize: number;
	/** size of the world area meant to be used for the game (in world units) */
	private readonly _worldSize: Vector2;
	/** center point of the world space (in world units) */
	private readonly _worldCenter: Vector2;

	private readonly _actorDirectory: ActorDirectory;
	private readonly _messageBroker: MessageBroker;
	private readonly _ui: UI;
	private readonly _inputActor: InputActor;

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

	startRound(treeNoiseParams: TreeNoiseParams) {
		// destroy actors
		this._actorDirectory.resetActors();

		// destroy any remaining engine objects
		engineObjectsDestroy();

		// re-create boundaries
		this._pathingActor.generateObstacles();

		// re-create trees
		this._pathingActor.generateTrees(treeNoiseParams);

		// re-create player/enemy actors
		this._playerActor = new PlayerActor(
			this._actorDirectory,
			this._messageBroker,
		);
		this._enemyActor = new EnemyActor(
			this._actorDirectory,
			this._messageBroker,
		);
	}

	endRound(): void {
		// destroy actors
		this._actorDirectory.resetActors();
		this._playerActor = null;
		this._enemyActor = null;

		// destroy any remaining engine objects
		engineObjectsDestroy();
	}

	private createPathingActor(): PathingActor {
		return new PathingActor(
			this._worldSize,
			this._arenaSize,
			this._spawnAreaSize,
			this._worldCenter,
			this._astarNodeSize,
			this._actorDirectory,
			this._messageBroker,
		);
	}
}
