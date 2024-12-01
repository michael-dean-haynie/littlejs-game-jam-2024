import type { Actor } from "./actors/actor";
import { PlayerActor } from "./actors/player-actor";
import type { Message } from "./messages/message";

export class ActorMessageBroker {
	constructor() {
		this._actors = [];
		const playerActor = new PlayerActor(this);
	}

	private readonly _actors: Actor[];

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
}
