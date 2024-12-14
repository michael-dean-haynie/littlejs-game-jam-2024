import alea from "alea";
import {
	type EngineObject,
	type Vector2,
	cameraPos,
	debugRect,
	engineObjects,
	getCameraSize,
	isOverlapping,
	rand,
	rgb,
	setCameraPos,
	vec2,
} from "littlejsengine";
import { createNoise2D } from "simplex-noise";
import { TreeEngineObject } from "../engine-objects/tree-engine-object";
import type { Game } from "../game/game";
import type { Message } from "../messages/message";
import { UnitRemovedMessage } from "../messages/unit-removed-message";
import { UnitTypes } from "../units/unit";
import { posInRect, sameVec2, yeet } from "../utilities/utilities";
import { Actor } from "./actor";
import { PathingActor } from "./pathing-actor";
import { UnitActor } from "./unit-actor";

export interface TreeNoiseParams {
	noiseType: "plain" | "simplex";
	threshold: number; // -1 - 1
	scale?: number; // 1-20?
	octaves?: number; // > 1 (maybe 1-5)
	persistance?: number; // 0 - 1
	lacunarity?: number; // > 1 (maybe 1-5)
}

export class WorldActor extends Actor {
	constructor(
		private readonly _game: Game,
		...params: ConstructorParameters<typeof Actor>
	) {
		super(...params);
		this.actorDirectory.registerActorAlias("worldActor", this.actorId);
		this._seed = Math.random();
		// this._sectorSize = 32; // 50 was causing frames to drop
		this._sectorSize = 17; // 32 was still causing frames to drop (17 is just over half camera view)
		this._lastCameraPos = vec2(0, 0);
		this._lastOccupiedSector = vec2(0, 0);
		// this._treeNoiseParams = {
		// 	noiseType: "plain",
		// 	threshold: -0.8,
		// };
		this._treeNoiseParams = {
			noiseType: "simplex",
			threshold: -0.8,
			scale: 25,
			octaves: 4,
			persistance: 0.8,
			lacunarity: 2,
		};
	}

	/** the size fo the x and y dimensions of each sector (in world units) */
	public readonly _sectorSize: number;

	private _lastCameraPos: Vector2;
	private _lastOccupiedSector: Vector2;

	private _seed: number;
	get seed(): number {
		return this._seed;
	}
	set seed(value: number) {
		this._seed = value;
	}

	private _treeNoiseParams: TreeNoiseParams;
	public get treeNoiseParams(): TreeNoiseParams {
		return this._treeNoiseParams;
	}
	public set treeNoiseParams(value: TreeNoiseParams) {
		this._treeNoiseParams = value;
	}

	protected handleMessage<T extends Message>(message: T): void {}

	update(): void {
		super.update();

		const unitActor = this.actorDirectory.getActorByAlias(
			"playerUnitActor",
			UnitActor,
		);
		if (unitActor) {
			// check for unit movement to center camera
			if (this._lastCameraPos.subtract(unitActor.pos).length() > 0) {
				this._lastCameraPos = unitActor.pos;
				setCameraPos(unitActor.pos);
			}

			// check for unit has moved into a new sector
			if (this._lastOccupiedSector.subtract(this.sector()).length() > 0) {
				this.moveToNewSector(this._lastOccupiedSector, this.sector());
				this._lastOccupiedSector = this.sector();
			}
		}
	}

	getRandomSpawnPos(): Vector2 {
		const pathingActor =
			this.actorDirectory.getActorByAlias("pathingActor", PathingActor) ??
			yeet();
		const unitActor = this.actorDirectory.getActorByAlias(
			"playerUnitActor",
			UnitActor,
		);
		if (!pathingActor || !unitActor) {
			throw new Error("expected actors to exist");
		}

		const center = this.sectorPos();
		const nineSectorSize = this._sectorSize * 3;
		let spawnPos: Vector2 = cameraPos;
		while (
			// while the spawn pos is inside the current sector or there is no path to player unit
			posInRect(spawnPos, cameraPos, getCameraSize()) ||
			!pathingActor.getPath(spawnPos, unitActor.pos)
		) {
			const x = rand(
				center.x - nineSectorSize / 2,
				center.x + nineSectorSize / 2,
			);
			const y = rand(
				center.y - nineSectorSize / 2,
				center.y + nineSectorSize / 2,
			);
			spawnPos = vec2(x, y);
		}
		return spawnPos;
	}

	generateTrees(): void {
		const params = this._treeNoiseParams;
		for (const sector of this.adjacentSectors()) {
			this.generateTreesInSector(sector, params);
		}
	}

	private generateTreesInSector(
		sector: Vector2,
		params: TreeNoiseParams,
	): void {
		this.destroyTreesInSector(sector);

		const { noiseType, threshold } = params;
		if (noiseType === "plain") {
			this.generatePlainTreesInSector(sector, threshold);
		} else if (noiseType === "simplex") {
			const { scale, octaves, persistance, lacunarity } = params;
			if (
				scale === undefined ||
				octaves === undefined ||
				persistance === undefined ||
				lacunarity === undefined
			) {
				throw new Error("missing params");
			}

			this.generateSimplexTreesInSector(
				sector,
				threshold,
				scale,
				octaves,
				persistance,
				lacunarity,
			);
		}

		// create special clearning for player unit in the origin sector
		if (sector.x === 0 && sector.y === 0) {
			this.destroyTreesInRect(vec2(0, 0), vec2(5));
		}

		// debugRect(this.sectorPos(sector), vec2(this._sectorSize), undefined, 5);
	}

	private generatePlainTreesInSector(sector: Vector2, threshold: number): void {
		const prng = alea(this._seed);

		// "sector x" and "sector y"
		for (let sx = 0; sx < this._sectorSize; sx++) {
			for (let sy = 0; sy < this._sectorSize; sy++) {
				// "world x" and "world y"
				const wx = this.sectorPos(sector).x + sx - this._sectorSize / 2;
				const wy = this.sectorPos(sector).y + sy - this._sectorSize / 2;

				const value = prng() * 2 - 1; // between -1 and 1
				if (value < threshold) {
					const obstacle = new TreeEngineObject(true, vec2(wx, wy), vec2(1, 1));
				}
			}
		}
	}

	private generateSimplexTreesInSector(
		sector: Vector2,
		threshold: number, // -1 - 1
		scale: number, // 1-20?
		octaves: number, // > 1 (maybe 1-5)
		persistance: number, // 0 - 1
		lacunarity: number, // > 1 (maybe 1-5)
	): void {
		const sectorOffset = this.sectorPos(sector).subtract(
			vec2(this._sectorSize / 2),
		);

		if (scale <= 0) {
			// biome-ignore lint: reasignment of param is safeguarding
			scale = 0.00001;
		}

		// init 2d array
		const noiseMap = Array.from({ length: this._sectorSize }, () =>
			Array(this._sectorSize).fill(0),
		);

		// fill in noise map
		const prng = alea(this._seed);
		const noise2d = createNoise2D(prng);
		for (let x = 0; x < this._sectorSize; x++) {
			for (let y = 0; y < this._sectorSize; y++) {
				let amplitude = 1;
				let frequency = 1;
				let noiseHeight = 0;

				for (let octave = 0; octave < octaves; octave++) {
					// TODO - maybe also offset back by subtracting half of the sector size
					const sampleX = ((x + sectorOffset.x) / scale) * frequency;
					const sampleY = ((y + sectorOffset.y) / scale) * frequency;

					const simplexValue = noise2d(sampleX, sampleY); // value between -1 and 1
					noiseHeight += simplexValue * amplitude;

					amplitude *= persistance;
					frequency *= lacunarity;
				}

				noiseMap[x][y] = noiseHeight;
			}
		}

		// create trees based off of noise map values
		for (let x = 0; x < this._sectorSize; x++) {
			for (let y = 0; y < this._sectorSize; y++) {
				if (noiseMap[x][y] < threshold) {
					const tree = new TreeEngineObject(
						true,
						vec2(x, y).add(sectorOffset),
						vec2(1, 1),
					);
				}
			}
		}
	}

	private destroyTreesInSector(sector: Vector2) {
		this.destroyTreesInRect(this.sectorPos(sector), vec2(this._sectorSize));
	}

	private destroyTreesInRect(pos: Vector2, size: Vector2) {
		for (const eo of engineObjects) {
			if (eo instanceof TreeEngineObject) {
				if (posInRect(eo.pos, pos, size)) {
					eo.destroy();
				}
			}
		}
	}

	/** get the sector that the camera target is currently in */
	sector(): Vector2 {
		const continuousSectorPos = cameraPos.scale(1 / this._sectorSize);
		const discreteSectorX = Math.round(continuousSectorPos.x);
		const discreteSectorY = Math.round(continuousSectorPos.y);
		return vec2(discreteSectorX, discreteSectorY);
	}

	/** get the postion of the center of a sector (in world units) */
	sectorPos(sector?: Vector2) {
		const resolvedSector = sector ?? this.sector();
		return resolvedSector.scale(this._sectorSize);
	}

	/** get an array of 9 sectors, the provided one + the 8 surrounding ones */
	private adjacentSectors(sector?: Vector2) {
		const resolvedSector = sector ?? this.sector();

		return [
			resolvedSector,
			resolvedSector.add(vec2(-1, 1)),
			resolvedSector.add(vec2(-1, 0)),
			resolvedSector.add(vec2(-1, -1)),
			resolvedSector.add(vec2(0, -1)),
			resolvedSector.add(vec2(1, -1)),
			resolvedSector.add(vec2(1, 0)),
			resolvedSector.add(vec2(1, 1)),
			resolvedSector.add(vec2(0, 1)),
		];
	}

	private moveToNewSector(prevSector: Vector2, newSector: Vector2) {
		// console.log(
		// 	`sector switch: (${prevSector.x}, ${prevSector.y}) -> (${newSector.x}, ${newSector.y})`,
		// );
		// debugRect(this.sectorPos(prevSector), vec2(this._sectorSize), undefined, 1);
		// debugRect(this.sectorPos(newSector), vec2(this._sectorSize), undefined, 1);

		const playerActorId =
			this.actorDirectory.getActorIdByAlias("playerActor") ?? yeet();
		const enemyActorId =
			this.actorDirectory.getActorIdByAlias("enemyActor") ?? yeet();

		const prevAdj = this.adjacentSectors(prevSector);
		const newAdj = this.adjacentSectors(newSector);

		// sectors that are in prev adj but not new adj
		const byeSectors = prevAdj.filter(
			(prevAdj) => !newAdj.some((newAdj) => sameVec2(prevAdj, newAdj)),
		);
		// sectors that are in new adj but not pref adj
		const hiSectors = newAdj.filter(
			(newAdj) => !prevAdj.some((prevAdj) => sameVec2(newAdj, prevAdj)),
		);

		// clean up actors in bye sectors
		for (const actor of this.actorDirectory.actors) {
			if (actor instanceof UnitActor) {
				if (actor.unitType === UnitTypes.prey) {
					continue; // don't do anything to the prey
				}

				const inByeSector = byeSectors.some((sector) => {
					return posInRect(
						actor.pos,
						this.sectorPos(sector),
						vec2(this._sectorSize),
					);
					// return isOverlapping(
					// 	actor.pos,
					// 	actor.size,
					// 	this.sectorPos(sector),
					// 	vec2(this._sectorSize),
					// );
				});
				if (inByeSector) {
					// alert player/enemy of removal
					this.messageBroker.publishMessage(
						new UnitRemovedMessage(actor.actorId, actor.unitType, actor.team),
						{
							actorIds: [playerActorId, enemyActorId],
						},
					);

					// destroy
					actor.destroy();
				}
			}
		}

		// destroy any remaining engine objects in bye sectors
		for (const eo of engineObjects) {
			const inByeSector = byeSectors.some((sector) => {
				return posInRect(
					eo.pos,
					this.sectorPos(sector),
					vec2(this._sectorSize),
				);
				// return isOverlapping(
				// 	eo.pos,
				// 	eo.size,
				// 	this.sectorPos(sector),
				// 	vec2(this._sectorSize),
				// );
			});
			if (inByeSector) {
				eo.destroy();
			}
		}

		// generate trees in new sectors
		for (const sector of hiSectors) {
			this.generateTreesInSector(sector, this.treeNoiseParams);
		}
	}
}
