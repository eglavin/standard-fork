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

	const files = mergeFiles(parsedConfig.data?.files, cliArguments.flags?.files);

	return {
		...usersConfig,
		path: cwd,
		files: files.length > 0 ? files : DEFAULT_CONFIG.files,
		changelogPresetConfig: getChangelogPresetConfig(usersConfig?.changelogPresetConfig),
	};
}

function mergeFiles(configFiles: string[] | undefined, cliFiles: string[] | undefined): string[] {
	return Array.from(
		new Set(
			([] as string[]).concat(
				Array.isArray(configFiles) ? configFiles : [],
				Array.isArray(cliFiles) ? cliFiles : [],
			),
		),
	);
}
