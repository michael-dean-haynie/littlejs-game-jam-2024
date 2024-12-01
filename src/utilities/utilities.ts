export type YeetReason = "UNEXPECTED_NULLISH_VALUE" | "SOME_OTHER_REASON";

/** ex: someMap.get('someKey') ?? yeet('UNEXPECTED_NULLISH_VALUE') */
export function yeet(reason: YeetReason = "UNEXPECTED_NULLISH_VALUE"): never {
	throw new Error(reason);
}

/** round number to the nearest increment
 * ```js
 * // example:
 * roundToNearest(3.3, .5); // => 3.5
 * ```
 */
export function roundToNearest(num: number, increment: number) {
	return Math.round(num / increment) * increment;
}
