import { type Vector2, vec2 } from "littlejsengine";
import type { Actor } from "./actors/actor";
import { EnemyActor } from "./actors/enemy-actor";
import { PlayerActor } from "./actors/player-actor";
import { UnitActor } from "./actors/unit-actor";
import type { PathingHelper } from "./helpers/pathing";
import type { Message } from "./messages/message";
import { yeet } from "./utilities/utilities";

export class MessageBroker {
	constructor(public readonly pathingHelper: PathingHelper) {
		this._actors = [];

		// initialize player actor
		const playerActor = new PlayerActor(this);

		// initialize enemy actor
		const enemyActor = new EnemyActor(this);
	}

	private readonly _actors: Actor[];

	get playerActor(): PlayerActor {
		// there should only be one player for now
		return (
			this._actors.find((actor) => actor instanceof PlayerActor) ??
			yeet("UNEXPECTED_NULLISH_VALUE")
		);
	}

	register(actor: Actor): void {
		this._actors.push(actor);
	}

	publish(message: Message) {
		for (const actor of this._actors) {
			actor.receive(message);
		}
	}

	update() {
		for (const actor of this._actors) {
			actor.update();
		}
	}

	getUnitActorById(unitId: string): UnitActor {
		const unitActors: UnitActor[] = this._actors.filter(
			(actor) => actor instanceof UnitActor,
		);
		return (
			unitActors.find((actor) => actor.unitId === unitId) ??
			yeet("UNEXPECTED_NULLISH_VALUE")
		);
	}

	getUnitActorsByProx(point: Vector2, size: number): UnitActor[] {
		const unitActors: UnitActor[] = this._actors.filter(
			(actor) => actor instanceof UnitActor,
		);
		return unitActors.filter((actor) => actor.doesOverlap(point, size));
	}
}
