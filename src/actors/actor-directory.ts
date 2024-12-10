import { type Constructor, yeet } from "../utilities/utilities";
import { Actor } from "./actor";

export class ActorDirectory {
	constructor() {
		this._actorMap = new Map<string, Actor>();
		this._actorAliasMap = new Map<string, string>();
		this._actorCtorMap = new Map<Constructor<Actor>, Map<string, Actor>>();
	}

	private readonly _actorMap: Map<string, Actor>;
	private readonly _actorAliasMap: Map<string, string>;
	private readonly _actorCtorMap: Map<Constructor<Actor>, Map<string, Actor>>;

	get actors(): ReadonlyArray<Actor> {
		return [...this._actorMap.values()];
	}

	registerActor(actor: Actor, alias?: ActorDirectoryAlias): void {
		// add to actor map
		this._actorMap.set(actor.actorId, actor);

		// add to ctor map
		const actorCtor = actor.constructor as Constructor<Actor>;
		if (!this._actorCtorMap.has(actorCtor)) {
			this._actorCtorMap.set(actorCtor, new Map<string, Actor>());
		}
		const ctorActors = this._actorCtorMap.get(actorCtor);
		if (ctorActors) {
			ctorActors.set(actor.actorId, actor);
		}

		// add to alias map
		if (alias) {
			this.registerActorAlias(alias, actor.actorId);
		}
	}

	unregisterActor(actorId: string): void {
		// remove from ctor map
		const actor = this.getActor(actorId, Actor);
		const actorCtor = actor.constructor as Constructor<Actor>;
		const ctorActors = this._actorCtorMap.get(actorCtor);
		if (ctorActors) {
			ctorActors.delete(actorId);
		}

		// remove from alias map
		for (const [key, value] of this._actorAliasMap.entries()) {
			if (value === actorId) {
				this._actorAliasMap.delete(key);
				break;
			}
		}

		// remove from actor map
		this._actorMap.delete(actorId);
	}

	registerActorAlias(alias: ActorDirectoryAlias, actorId: string) {
		this._actorAliasMap.set(alias, actorId);
	}

	unregisterActorAlias(alias: ActorDirectoryAlias) {
		this._actorAliasMap.delete(alias);
	}

	getActorIdByAlias(alias: ActorDirectoryAlias): string {
		return this._actorAliasMap.get(alias) || yeet("UNEXPECTED_NULLISH_VALUE");
	}

	getActorByAlias<T extends Actor>(
		alias: ActorDirectoryAlias,
		type: Constructor<T>,
	): T {
		const actorId =
			this.getActorIdByAlias(alias) ?? yeet("UNEXPECTED_NULLISH_VALUE");
		return this.getActor<T>(actorId, type);
	}

	getActor<T extends Actor>(actorId: string, type: Constructor<T>): T {
		const actor = this._actorMap.get(actorId);
		if (!actor) {
			throw new Error("could not find actor");
		}
		if (actor instanceof type) {
			return actor;
		}
		throw new Error("actor instance was not expected type");
	}

	getActorsByType<T extends Actor>(type: Constructor<T>): Map<string, T> {
		const ctorActors = this._actorCtorMap.get(type);
		if (ctorActors) {
			return new Map<string, T>(ctorActors as Map<string, T>); // shallow copy to avoid mutations
		}
		return new Map<string, T>();
	}
}

export const ActorDirectoryAliases = [
	"playerActor",
	"enemyActor",
	"playerUnitActor",
	"pathingActor",
] as const;
export type ActorDirectoryAlias = (typeof ActorDirectoryAliases)[number];

export function IsActorDirectoryAlias(
	value: string | null,
): value is ActorDirectoryAlias {
	return ActorDirectoryAliases.includes(value as ActorDirectoryAlias);
}