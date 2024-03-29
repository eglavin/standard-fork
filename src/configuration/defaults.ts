import type { ForkConfig } from "./schema";

export const DEFAULT_CONFIG: ForkConfig = {
	workingDirectory: process.cwd(),
	changelog: "CHANGELOG.md",
	bumpFiles: [
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
	dryRun: false,
	gitTagFallback: true,
	sign: false,
	silent: false,
	verify: false,

	changelogPresetConfig: {},
};
