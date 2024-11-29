export type YeetReason = "UNEXPECTED_NULLISH_VALUE" | "SOME_OTHER_REASON";

/** ex: someMap.get('someKey') ?? yeet('UNEXPECTED_NULLISH_VALUE') */
export function yeet(reason: YeetReason = "UNEXPECTED_NULLISH_VALUE"): never {
	throw new Error(reason);
}
