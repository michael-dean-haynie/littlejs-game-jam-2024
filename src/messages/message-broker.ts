import { isIntersecting } from "littlejsengine";
import { Actor } from "../actors/actor";
import type { ActorDirectory } from "../actors/actor-directory";
import { UnitActor } from "../actors/unit-actor";
import type { Message } from "./message";
import type {
	IntersectingRayRoutingRule,
	MessageRoutingRules,
} from "./message-routing-rules";

export class MessageBroker {
	constructor(private _actorDirectory: ActorDirectory) {}

	/** right now defaults to no matches, multiple route data composed in AND fashion */
	publishMessage(message: Message, rules: MessageRoutingRules = {}): void {
		if (!Object.keys(rules).length) {
			return; // do nothing if there are no rules defined
		}

		let remaining: Map<string, Actor> | null = null;

		if (rules.actorIds?.length) {
			remaining = new Map<string, Actor>();
			for (const actorId of rules.actorIds) {
				remaining.set(actorId, this._actorDirectory.getActor(actorId, Actor));
			}
		}

		if (rules.intersecting?.length) {
			if (remaining === null) {
				// narrowed down to unit actors - they are the only ones with engine objects
				remaining = this._actorDirectory.getActorsByType(UnitActor);
			}

			// forced to iterate over each at this point
			for (const [actorId, actor] of remaining.entries()) {
				if (actor instanceof UnitActor) {
					// check for intersection with rays
					const doesIntersect = rules.intersecting.some((ray) =>
						isIntersecting(ray.start, ray.end, actor.pos, actor.size),
					);
					if (!doesIntersect) {
						remaining.delete(actorId);
					}
				}
			}
		}

		if (rules.excludeActorIds?.length) {
			if (remaining?.size) {
				for (const [actorId, actor] of remaining.entries()) {
					if (rules.excludeActorIds.includes(actorId)) {
						remaining.delete(actorId);
					}
				}
			}
		}

		if (remaining?.size) {
			for (const [actorId, actor] of remaining.entries()) {
				actor.receiveMessage(message);
			}
		}
	}
}
