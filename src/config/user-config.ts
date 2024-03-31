import path from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";

import { ForkConfigSchema, type ForkConfig } from "./schema";
import { DEFAULT_CONFIG } from "./defaults";
import { getCliArguments } from "./cli-arguments";
import { getChangelogPresetConfig } from "./changelog-preset-config";

export async function getUserConfig(): Promise<ForkConfig> {
	const cliArguments = getCliArguments();

	const cwd = process.cwd();
	const joycon = new JoyCon();
	const configFilePath = await joycon.resolve({
		files: ["fork.config.ts", "fork.config.js", "fork.config.cjs", "fork.config.mjs"],
		cwd,
		stopDir: path.parse(cwd).root,
	});

	if (configFilePath) {
		const foundConfig = await bundleRequire({ filepath: configFilePath });
		const parsedConfig = ForkConfigSchema.partial().safeParse(
			foundConfig.mod.default || foundConfig.mod,
		);

		if (parsedConfig.success) {
			const usersConfig = Object.assign({}, DEFAULT_CONFIG, parsedConfig.data, cliArguments.flags);

			// Allow users to add additional bumpFiles
			const mergedBumpFiles = DEFAULT_CONFIG.bumpFiles.concat(
				Array.isArray(parsedConfig.data?.bumpFiles) ? parsedConfig.data.bumpFiles : [],
				Array.isArray(cliArguments.flags?.bumpFiles) ? cliArguments.flags.bumpFiles : [],
			);

			return Object.assign(usersConfig, {
				changelogPresetConfig: getChangelogPresetConfig(usersConfig?.changelogPresetConfig),
				bumpFiles: Array.from(new Set(mergedBumpFiles)),
			});
		} else {
			throw parsedConfig.error;
		}
	}

	return Object.assign(DEFAULT_CONFIG, cliArguments.flags, {
		changelogPresetConfig: getChangelogPresetConfig(),
	});
}
