import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
		globals: true,
		restoreMocks: true,
		coverage: {
			include: ["src/**/*"],
			all: true,
			reporter: ["cobertura", "html", "text"],
		},
		typecheck: {
			tsconfig: "tsconfig.test.json",
		},
	},
});
