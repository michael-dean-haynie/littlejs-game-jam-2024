import { PI, rand, randInt, vec2 } from "littlejsengine";
import { expect, test } from "vitest";

test.skip("example 1", () => {
	const spread = Math.PI / 2; // 90 degrees
	const range = 2;
	const gap = 0.5;
	const rays = Math.ceil(spread / (2 * Math.asin(gap / (2 * range))));
});

test.skip("example 2", () => {
	for (const value of [0, 1, 2, 3, 4, 5, 6, 7, PI / 2, PI, PI * (3 / 4)]) {
		console.log(`in: ${value}, out: ${vec2().setAngle(0, 0).angle()}`);
	}
});

test.skip("example 3", () => {
	console.log(rand(3, 8));
	console.log(rand(8, 3));
});

test("example 4", () => {
	console.log(typeof []);
	console.log(Array.isArray([]));
});
