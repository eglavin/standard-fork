import { readFileSync } from "node:fs";
import { parse, resolve } from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";
import { glob } from "glob";

import { ForkConfigSchema } from "./schema";
import { DEFAULT_CONFIG } from "./defaults";
import { getCliArguments } from "./cli-arguments";
import { getChangelogPresetConfig } from "./changelog-preset-config";
import { detectGitHost } from "./detect-git-host";
import type { Config, ForkConfig } from "./types";

/**
 * Name of the key in the package.json file that contains the users configuration.
 */
const PACKAGE_JSON_CONFIG_KEY = "fork-version";

export async function getUserConfig(): Promise<ForkConfig> {
	const cliArguments = getCliArguments();

	const cwd = cliArguments.flags.path ? resolve(cliArguments.flags.path) : process.cwd();
	const joycon = new JoyCon({
		cwd,
		packageKey: PACKAGE_JSON_CONFIG_KEY,
		stopDir: parse(cwd).root,
	});
	const configFilePath = await joycon.resolve([
		"fork.config.ts",
		"fork.config.js",
		"fork.config.cjs",
		"fork.config.mjs",
		"fork.config.json",
		"package.json",
	]);

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

	const detectedGitHost = await detectGitHost(cwd);

	return {
		...mergedConfig,

		files: getFilesList(configFile?.files, cliArguments.flags?.files, globResults),
		path: cwd,
		preRelease:
			// Meow doesn't support multiple flags with the same name, so we need to check both.
			cliArguments.flags.preReleaseTag ?? cliArguments.flags.preRelease ?? configFile.preRelease,
		changelogPresetConfig: getChangelogPresetConfig(
			mergedConfig,
			cliArguments.flags,
			detectedGitHost,
		),
	};
}

async function loadConfigFile(configFilePath: string | null) {
	if (!configFilePath) {
		return {};
	}

	// Handle json config file.
	if (configFilePath.endsWith("json")) {
		const fileContent = JSON.parse(readFileSync(configFilePath).toString());

		// Handle package.json config file.
		if (configFilePath.endsWith("package.json")) {
			if (
				fileContent[PACKAGE_JSON_CONFIG_KEY] &&
				typeof fileContent[PACKAGE_JSON_CONFIG_KEY] === "object"
			) {
				const parsed = ForkConfigSchema.partial().safeParse(fileContent[PACKAGE_JSON_CONFIG_KEY]);
				if (!parsed.success) {
					throw new Error(`Validation error in: ${configFilePath}`, { cause: parsed.error });
				}
				return parsed.data;
			}

			return {};
		}

		const parsed = ForkConfigSchema.partial().safeParse(fileContent);
		if (!parsed.success) {
			throw new Error(`Validation error in: ${configFilePath}`, { cause: parsed.error });
		}
		return parsed.data;
	}

	// Otherwise expect config file to use js or ts.
	const fileContent = await bundleRequire({ filepath: configFilePath });

	const parsed = ForkConfigSchema.partial().safeParse(fileContent.mod.default || fileContent.mod);
	if (!parsed.success) {
		throw new Error(`Validation error in: ${configFilePath}`, { cause: parsed.error });
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

export function defineConfig(config: Config): Config {
	return config;
}
