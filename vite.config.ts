/// <reference types="vitest/config" />
import path from "node:path";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig(({ mode }) => ({
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
							"node_modules/littlejsengine/dist/littlejs.esm.min.js",
						),
		},
	},
	test: {
		environment: "jsdom",
	},
}));
