import type { Actor } from "./actors/actor";
import { PlayerActor } from "./actors/player-actor";
import type { Message } from "./messages/message";
import { yeet } from "./utilities/utilities";

export class MessageBroker {
	constructor() {
		this._actors = [];

		// initialize player actor
		const playerActor = new PlayerActor(this);
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
}
