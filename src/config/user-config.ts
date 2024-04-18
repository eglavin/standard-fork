import { parse, resolve } from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";

import { ForkConfigSchema, type ForkConfig } from "./schema";
import { DEFAULT_CONFIG } from "./defaults";
import { getCliArguments } from "./cli-arguments";
import { getChangelogPresetConfig } from "./changelog-preset-config";

export async function getUserConfig(): Promise<ForkConfig> {
	const cliArguments = getCliArguments();

	const cwd = cliArguments.flags.path ? resolve(cliArguments.flags.path) : process.cwd();
	const joycon = new JoyCon();
	const configFilePath = await joycon.resolve({
		files: ["fork.config.ts", "fork.config.js", "fork.config.cjs", "fork.config.mjs"],
		cwd,
		stopDir: parse(cwd).root,
	});

	if (!configFilePath) {
		return {
			...DEFAULT_CONFIG,
			...cliArguments.flags,
			path: cwd,
			changelogPresetConfig: getChangelogPresetConfig(),
		} as ForkConfig;
	}

	const foundConfig = await bundleRequire({ filepath: configFilePath });
	const parsedConfig = ForkConfigSchema.partial().safeParse(
		foundConfig.mod.default || foundConfig.mod,
	);

	if (!parsedConfig.success) {
		throw parsedConfig.error;
	}

	const usersConfig = {
		...DEFAULT_CONFIG,
		...parsedConfig.data,
		...cliArguments.flags,
	} as ForkConfig;

	return {
		...usersConfig,
		path: cwd,
		files: getFiles(parsedConfig.data?.files, cliArguments.flags?.files),
		changelogPresetConfig: getChangelogPresetConfig(usersConfig?.changelogPresetConfig),
	};
}

function getFiles(configFiles: string[] | undefined, cliFiles: string[] | undefined): string[] {
	const listOfFiles = new Set<string>();

	// Add files from the users config file
	if (Array.isArray(configFiles)) {
		configFiles.forEach((file) => listOfFiles.add(file));
	}

	// Add files from the cli arguments
	if (Array.isArray(cliFiles)) {
		cliFiles.forEach((file) => listOfFiles.add(file));
	}

	// If the user has defined files use them, otherwise use the default list of files.
	if (listOfFiles.size) {
		return Array.from(listOfFiles);
	}

	return DEFAULT_CONFIG.files;
}
