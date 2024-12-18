/// <reference types="vitest/config" />
import path from "node:path";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig(({ mode }) => ({
	base: "./",
	server: {
		port: 2024,
	},
	plugins: [
		checker({ typescript: true }), // Enable TypeScript checking
	],
	resolve: {
		alias: {
			littlejsengine:
				mode === "development"
					? path.resolve(
							__dirname,
							"node_modules/littlejsengine/dist/littlejs.esm.js",
						)
					: path.resolve(
							__dirname,
							// TODO: stop using debug dist just because I need the gun shot to show up
							// "node_modules/littlejsengine/dist/littlejs.esm.min.js",
							"node_modules/littlejsengine/dist/littlejs.esm.js",
						),
		},
	},
	test: {
		environment: "jsdom",
		setupFiles: "./src/test-setup.ts", // required to mock out AudioContext used by littlejs
	},
}));
