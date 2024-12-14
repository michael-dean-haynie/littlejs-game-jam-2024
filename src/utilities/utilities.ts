import type { Vector2 } from "littlejsengine";

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

/** generic constructor signature (allow abstract ctors too) */
// biome-ignore lint/suspicious/noExplicitAny: meant to be any
export type Constructor<T> = abstract new (...args: any[]) => T;

export function sameVec2(a: Vector2, b: Vector2) {
	return a.x === b.x && a.y === b.y;
}

/**
 * Checks if a position is inside a rect.
 * Important that it doesn't generously accept points on the far edges.
 * This is so that engine objects can belong to exactly 1 sector, even though they overlap multiple.
 * So points will match on the lower end, but not the upper end.
 */
export function posInRect(pos: Vector2, rectPos: Vector2, rectSize: Vector2) {
	const bottomLeft = rectPos.subtract(rectSize.scale(0.5));
	const topRight = rectPos.add(rectSize.scale(0.5));
	if (
		pos.x >= bottomLeft.x &&
		pos.y >= bottomLeft.y &&
		pos.x < topRight.x &&
		pos.y < topRight.y
	) {
		return true;
	}

	return false;
}

// Function to load HTML content from a file
export async function loadHtmlComponent(
	containerSelector: string,
	filePath: string,
) {
	try {
		const response = await fetch(filePath);
		if (!response.ok) {
			throw new Error(`Failed to load file: ${filePath}`);
		}

		const htmlContent = await response.text();
		const container = document.querySelector(containerSelector);
		if (!container) {
			throw new Error(`Failed to find element: ${containerSelector}`);
		}
		container.innerHTML = htmlContent;
	} catch (error) {
		console.error(error);
	}
}
