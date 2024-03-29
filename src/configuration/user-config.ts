import path from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";
import conventionalChangelogConfigSpec from "conventional-changelog-config-spec";
import { ForkConfigSchema, ForkConfig } from "./schema.js";
import { DEFAULT_CONFIG } from "./defaults.js";
import { getCliArguments } from "./cli-arguments.js";

export function defineConfig(config: Partial<ForkConfig>): Partial<ForkConfig> {
	return config;
}

function getPresetDefaults(usersChangelogPresetConfig?: ForkConfig["changelogPresetConfig"]) {
	const preset: { name: string; [_: string]: unknown } = {
		name: "conventionalcommits",
	};

	// First take any default values from the conventional-changelog-config-spec
	if (typeof conventionalChangelogConfigSpec.properties === "object") {
		Object.entries(conventionalChangelogConfigSpec.properties).forEach(([key, value]) => {
			if ("default" in value && value.default !== undefined) {
				preset[key] = value.default;
			}
		});
	}

	// Then overwrite with any values from the users config
	if (usersChangelogPresetConfig && typeof usersChangelogPresetConfig === "object") {
		Object.entries(usersChangelogPresetConfig).forEach(([key, value]) => {
			if (value !== undefined) {
				preset[key] = value;
			}
		});
	}

	return preset;
}

export async function getForkConfig(): Promise<ForkConfig> {
	const cliArguments = getCliArguments();

	const cwd = process.cwd();
	const joycon = new JoyCon();
	const configFilePath = await joycon.resolve({
		files: ["fork.config.js"],
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

			// Allow users to override the default debug function
			if ("debug" in parsedConfig && typeof parsedConfig.debug === "function") {
				usersConfig.debug = parsedConfig.debug as ForkConfig["debug"];
			}

			// If silent is true, override the default log functions.
			if (usersConfig.silent) {
				usersConfig.log = () => {};
				usersConfig.error = () => {};
				usersConfig.debug = () => {};
			}

			// Allow users to add additional bumpFiles
			const mergedBumpFiles = DEFAULT_CONFIG.bumpFiles.concat(
				Array.isArray(parsedConfig.data?.bumpFiles) ? parsedConfig.data.bumpFiles : [],
				Array.isArray(cliArguments.flags?.bumpFiles) ? cliArguments.flags.bumpFiles : [],
			);

			return Object.assign(usersConfig, {
				changelogPresetConfig: getPresetDefaults(usersConfig?.changelogPresetConfig),
				bumpFiles: Array.from(new Set(mergedBumpFiles)),
			});
		} else {
			throw parsedConfig.error;
		}
	}

	return Object.assign(DEFAULT_CONFIG, cliArguments.flags, {
		changelogPresetConfig: getPresetDefaults(),
	});
}
