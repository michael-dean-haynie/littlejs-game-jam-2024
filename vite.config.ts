/// <reference types="vitest/config" />
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
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
	// test: {},
}));
