import type { Vector2 } from "littlejsengine";
import type { Actor } from "../actors/actor";

export interface MessageRoutingRules {
	actorIds?: string[];
	excludeActorIds?: string[];
	// biome-ignore lint/suspicious/noExplicitAny: it's a constructor signature
	actorType?: { new (...args: any[]): Actor };
	intersecting?: IntersectingRoutingRule[];
}

/** checks if rays intersect with unit */
export interface IntersectingRoutingRule {
	start: Vector2;
	end: Vector2;
}
