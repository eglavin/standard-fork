import { readFileSync } from "node:fs";
import { parse, resolve } from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";
import { glob } from "glob";

import { ForkConfigSchema, type ForkConfig } from "./schema";
import { DEFAULT_CONFIG } from "./defaults";
import { getCliArguments } from "./cli-arguments";
import { getChangelogPresetConfig } from "./changelog-preset-config";

export async function getUserConfig(): Promise<ForkConfig> {
	const cliArguments = getCliArguments();

	const cwd = cliArguments.flags.path ? resolve(cliArguments.flags.path) : process.cwd();
	const joycon = new JoyCon();
	const configFilePath = await joycon.resolve({
		files: [
			"fork.config.ts",
			"fork.config.js",
			"fork.config.cjs",
			"fork.config.mjs",
			"fork.config.json",
		],
		cwd,
		stopDir: parse(cwd).root,
	});

	const configFile = await loadConfigFile(configFilePath);

	const mergedConfig = {
		...DEFAULT_CONFIG,
		...configFile,
		...cliArguments.flags,
	} as ForkConfig;

	// If the user has defined a glob pattern, use it to find the requested files.
	let globResults: string[] = [];
	if (mergedConfig.glob) {
		globResults = await glob(mergedConfig.glob, {
			cwd: cwd,
			ignore: ["node_modules/**"],
			nodir: true,
		});
	}

	return {
		...mergedConfig,

		path: cwd,
		files: getFilesList(configFile?.files, cliArguments.flags?.files, globResults),
		changelogPresetConfig: getChangelogPresetConfig(mergedConfig?.changelogPresetConfig),
	};
}

async function loadConfigFile(configFilePath: string | null) {
	if (!configFilePath) {
		return {};
	}

	// Handle json config file.
	if (configFilePath.endsWith("json")) {
		const fileContent = JSON.parse(readFileSync(configFilePath).toString());

		const parsed = ForkConfigSchema.partial().safeParse(fileContent);
		if (!parsed.success) {
			throw parsed.error;
		}
		return parsed.data;
	}

	// Otherwise expect config file to use js or ts.
	const fileContent = await bundleRequire({ filepath: configFilePath });

	const parsed = ForkConfigSchema.partial().safeParse(fileContent.mod.default || fileContent.mod);
	if (!parsed.success) {
		throw parsed.error;
	}
	return parsed.data;
}

function getFilesList(
	configFiles: string[] | undefined,
	cliFiles: string[] | undefined,
	globResults: string[],
): string[] {
	const listOfFiles = new Set<string>();

	// Add files from the users config file
	if (Array.isArray(configFiles)) {
		configFiles.forEach((file) => listOfFiles.add(file));
	}

	// Add files from the cli arguments
	if (Array.isArray(cliFiles)) {
		cliFiles.forEach((file) => listOfFiles.add(file));
	}

	// Add files from glob results
	globResults.forEach((file) => listOfFiles.add(file));

	// If the user has defined files use them, otherwise use the default list of files.
	if (listOfFiles.size) {
		return Array.from(listOfFiles);
	}

	return DEFAULT_CONFIG.files;
}
