import { defineConfig } from "vitest/config";

export default defineConfig( {
	test: {
		globals: true,
		environment: "node",
		coverage: {
			provider: "istanbul",
			enabled: true,
			include: [ "src/**/*.ts" ],
			exclude: [ "src/main.ts" ],
			all: true,
			clean: true
		}
	}
} );