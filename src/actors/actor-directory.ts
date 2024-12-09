import { yeet } from "../utilities/utilities";
import type { Actor } from "./actor";

export class ActorDirectory {
	constructor() {
		this._actorMap = new Map<string, Actor>();
		this._actorAliasMap = new Map<string, string>();
	}

	private readonly _actorMap: Map<string, Actor>;
	private readonly _actorAliasMap: Map<string, string>;

	get actors(): ReadonlyArray<Actor> {
		return [...this._actorMap.values()];
	}

	registerActor<T extends Actor>(actor: T, alias?: ActorDirectoryAlias): void {
		this._actorMap.set(actor.actorId, actor);
		if (alias) {
			this.registerActorAlias(alias, actor.actorId);
		}
	}

	unregisterActorById(actorId: string): void {
		// remove from actor map
		this._actorMap.delete(actorId);

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
		type: { new (...args: any[]): T },
	): T {
		const actor = this._actorMap.get(actorId);
		if (actor instanceof type) {
			return actor;
		}
		throw new Error("actor instance was not expected type");
	}

	getActorIdByAlias(alias: ActorDirectoryAlias): string {
		return this._actorAliasMap.get(alias) || yeet("UNEXPECTED_NULLISH_VALUE");
	}

	getActorByAlias<T extends Actor>(
		alias: ActorDirectoryAlias,
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
