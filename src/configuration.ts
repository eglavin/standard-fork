import path from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";
import { z } from "zod";

const ConfigSchema = z.object({
	/**
	 * The name of the changelog file.
	 */
	changelog: z.string(),

	/**
	 * Files to be updated.
	 */
	outFiles: z.array(z.string()),

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
	changelog: "CHANGELOG.md",

	outFiles: ["package.json", "package-lock.json"],

	dry: false,
	silent: false,
};

export function defineConfig(config: Partial<ForkConfig>): Partial<ForkConfig> {
	const parsedConfig = ConfigSchema.partial().safeParse(config);
	if (parsedConfig.success) {
		return parsedConfig.data;
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

			const parsedConfig = ConfigSchema.partial().safeParse(config.mod.default || config.mod);
			if (parsedConfig.success) {
				const { ...userConf } = parsedConfig.data;

				this.config = {
					...this.config,
					...userConf,
					outFiles: Array.from(new Set(this.config.outFiles.concat(userConf?.outFiles || []))),
				};
			}
		}
	}

	public getConfig() {
		return this.config;
	}
}
