import { resolve } from "node:path";
import { glob } from "glob";

import { getChangelogPresetConfig } from "./changelog-preset-config";
import { DEFAULT_CONFIG } from "./defaults";
import { detectGitHost } from "./detect-git-host";
import { loadConfigFile } from "./load-config";
import { mergeFiles } from "./merge-files";
import type { getCliArguments } from "./cli-arguments";
import type { ForkConfig } from "./types";

export async function getUserConfig(
	cliArguments: Partial<ReturnType<typeof getCliArguments>>,
): Promise<ForkConfig> {
	const cwd = cliArguments.path ? resolve(cliArguments.path) : process.cwd();

	const configFile = await loadConfigFile(cwd);

	const mergedConfig = {
		...DEFAULT_CONFIG,
		...configFile,
		...cliArguments,
	} as ForkConfig;

	let globResults: string[] = [];
	if (mergedConfig.glob) {
		globResults = await glob(mergedConfig.glob, {
			cwd,
			ignore: ["node_modules/**"],
			nodir: true,
		});
	}

	const files = mergeFiles(configFile?.files, cliArguments?.files, globResults);
	const detectedGitHost = await detectGitHost(cwd);
	const changelogPresetConfig = getChangelogPresetConfig(
		mergedConfig,
		cliArguments,
		detectedGitHost,
	);

	return {
		...mergedConfig,

		files,
		path: cwd,
		preRelease:
			// Meow doesn't support multiple flags with the same name, so we need to check both.
			cliArguments.preReleaseTag ?? cliArguments.preRelease ?? configFile.preRelease,
		changelogPresetConfig,
	};
}
