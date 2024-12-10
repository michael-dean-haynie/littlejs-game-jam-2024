import type { Vector2 } from "littlejsengine";
import type { Actor } from "../actors/actor";
import type { Constructor } from "../utilities/utilities";

export interface MessageRoutingRules {
	actorIds?: string[];
	intersecting?: IntersectingRayRoutingRule[];
	// actorType?: Constructor<Actor>;
	excludeActorIds?: string[]; // won't work by itself
}

/** checks if rays intersect with unit */
export interface IntersectingRayRoutingRule {
	start: Vector2;
	end: Vector2;
}
