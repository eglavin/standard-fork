import path from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";
import { z } from "zod";

const ConfigSchema = z.object({
	/**
	 * The path to the changelog file.
	 */
	infile: z.string(),

	/**
	 * If true, no output will be written to disk.
	 */
	dry: z.boolean(),
	/**
	 * If true, no output will be written to stdout.
	 */
	silent: z.boolean(),
});

export type ForkConfig = z.infer<typeof ConfigSchema>;

const DEFAULT_FORK_CONFIG: ForkConfig = {
	infile: "CHANGELOG.md",
	dry: false,
	silent: false,
};

export function defineConfig(config: ForkConfig): ForkConfig {
	if (ConfigSchema.safeParse(config).success) {
		return config;
	}
	return DEFAULT_FORK_CONFIG;
}

export class ConfigurationClass {
	private config: ForkConfig = { ...DEFAULT_FORK_CONFIG };

	constructor() {}

	public async readConfig() {
		const cwd = process.cwd();

		const joycon = new JoyCon.default();
		const configPath = await joycon.resolve({
			files: ["fork.config.js"],
			cwd: cwd,
			stopDir: path.parse(cwd).root,
		});

		if (configPath) {
			const config = await bundleRequire({
				filepath: configPath,
			});

			const parsedConfig = ConfigSchema.safeParse(config.mod.default || config.mod);

			if (parsedConfig.success) {
				this.config = {
					...this.config,
					...parsedConfig.data,
				};
			}
		}
	}

	public getConfig() {
		return this.config;
	}
}
