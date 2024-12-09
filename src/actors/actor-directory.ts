import { yeet } from "../utilities/utilities";
import type { Actor } from "./actor";

export class ActorDirectory {
	constructor() {
		this._actors = [];
		this._actorAliasMap = new Map<string, string>();
	}

	private readonly _actors: Actor[];
	private readonly _actorAliasMap: Map<string, string>;

	get actors(): ReadonlyArray<Actor> {
		return this._actors;
	}

	registerActor<T extends Actor>(actor: T, alias?: ActorDirectoryAlias): void {
		this._actors.push(actor);
		if (alias) {
			this._actorAliasMap.set(alias, actor.actorId);
		}
	}

	unregisterActorById(actorId: string): void {
		// remove from actors array
		const actorIndex = this._actors.findIndex(
			(actor) => actor.actorId === actorId,
		);
		if (actorIndex !== -1) {
			this._actors.splice(actorIndex, 1);
		}

		// remove from alias map
		for (const [key, value] of this._actorAliasMap.entries()) {
			if (value === actorId) {
				this._actorAliasMap.delete(key);
				break;
			}
		}
	}

	registerActorAlias(alias: ActorDirectoryAlias, actorId: string) {
		this._actorAliasMap.set(alias, actorId);
	}

	unregisterActorAlias(alias: ActorDirectoryAlias) {
		this._actorAliasMap.delete(alias);
	}

	getActorById<T extends Actor>(
		actorId: string,
		// biome-ignore lint/suspicious/noExplicitAny: it's a constructor signature
		type: { new (...args: any[]): T },
	): T {
		for (const actor of this._actors) {
			if (actor instanceof type && actor.actorId === actorId) {
				return actor;
			}
		}
		yeet("UNEXPECTED_NULLISH_VALUE");
	}

	getActorIdByAlias(alias: ActorDirectoryAlias): string {
		return this._actorAliasMap.get(alias) || yeet("UNEXPECTED_NULLISH_VALUE");
	}

	getActorByAlias<T extends Actor>(
		alias: ActorDirectoryAlias,
		// biome-ignore lint/suspicious/noExplicitAny: it's a constructor signature
		type: { new (...args: any[]): T },
	): T {
		const actorId =
			this.getActorIdByAlias(alias) ?? yeet("UNEXPECTED_NULLISH_VALUE");
		return this.getActorById<T>(actorId, type);
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
