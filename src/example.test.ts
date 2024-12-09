import { PI, vec2 } from "littlejsengine";
import { expect, test } from "vitest";

test.skip("example 1", () => {
	const spread = Math.PI / 2; // 90 degrees
	const range = 2;
	const gap = 0.5;
	const rays = Math.ceil(spread / (2 * Math.asin(gap / (2 * range))));
});

test("example 2", () => {
	for (const value of [0, 1, 2, 3, 4, 5, 6, 7, PI / 2, PI, PI * (3 / 4)]) {
		console.log(`in: ${value}, out: ${vec2().setAngle(0, 0).angle()}`);
	}
});
