import { isIntersecting } from "littlejsengine";
import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import type { Message } from "./message";
import type { MessageRoutingRules } from "./message-routing-rules";

export class MessageBroker {
	constructor(private _actorDirectory: ActorDirectory) {}

	/** right now defaults to no matches, multiple route data composed in AND fashion */
	publishMessage<T extends Message>(
		message: T,
		rules: MessageRoutingRules = {},
	): void {
		for (const actor of this._actorDirectory.actors) {
			// check for empty rules
			if (!rules || !Object.keys(rules).length) {
				continue;
			}

			// check actor type
			if (rules.actorType && !(actor instanceof rules.actorType)) {
				continue;
			}

			// check actor id
			if (
				rules.actorIds &&
				!rules.actorIds.some((aid) => aid === actor.actorId)
			) {
				continue;
			}

			// check actor id excludion list
			if (rules.excludeActorIds?.includes(actor.actorId)) {
				continue;
			}

			// check intersecting rays
			if (rules.intersecting && actor instanceof UnitActor) {
				let doesIntersect = false;
				for (const ray of rules.intersecting) {
					if (isIntersecting(ray.start, ray.end, actor.pos, actor.size)) {
						doesIntersect = true;
						break;
					}
				}
				if (!doesIntersect) {
					continue;
				}
			}

			// send message to actor
			actor.receiveMessage(message);
		}
	}
}
