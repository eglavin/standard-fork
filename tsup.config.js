import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/cli.ts"],
	format: ["cjs", "esm"],
	clean: true,
	dts: true,
	sourcemap: true,
	splitting: true,
	treeshake: true,
});
