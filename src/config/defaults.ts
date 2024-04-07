import type { ForkConfig } from "./schema";

export const DEFAULT_CONFIG: ForkConfig = {
	path: process.cwd(),
	changelog: "CHANGELOG.md",
	files: [
		"package.json",
		"package-lock.json",
		"npm-shrinkwrap.json",
		"manifest.json", // Chrome extensions
		"bower.json",
	],
	header: `# Changelog

All notable changes to this project will be documented in this file. See [fork-version](https://github.com/eglavin/fork-version) for commit guidelines.
`,
	tagPrefix: "v",

	commitAll: false,
	debug: false,
	dryRun: false,
	gitTagFallback: true,
	inspectVersion: false,
	sign: false,
	silent: false,
	verify: false,

	changelogPresetConfig: {},
};
