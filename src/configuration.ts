import path from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";
import { z } from "zod";

const ForkConfigSchema = z.object({
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

export interface IForkConfig extends z.infer<typeof ForkConfigSchema> {}

const DEFAULT_CONFIG: IForkConfig = {
	changelog: "CHANGELOG.md",
	outFiles: ["package.json", "package-lock.json"],

	dry: false,
	silent: false,
};

export function defineConfig(config: Partial<IForkConfig>): Partial<IForkConfig> {
	const parsedConfig = ForkConfigSchema.partial().safeParse(config);
	if (parsedConfig.success) {
		return parsedConfig.data;
	}
	return DEFAULT_CONFIG;
}

export class ForkConfig {
	private config: IForkConfig = { ...DEFAULT_CONFIG };

	public async readConfig() {
		const cwd = process.cwd();

		const joycon = new JoyCon.default();
		const configPath = await joycon.resolve({
			files: ["fork.config.js"],
			cwd: cwd,
			stopDir: path.parse(cwd).root,
		});

		if (configPath) {
			const config = await bundleRequire({ filepath: configPath });

			const parsedConfig = ForkConfigSchema.partial().safeParse(config.mod.default || config.mod);
			if (parsedConfig.success) {
				const _outFiles = DEFAULT_CONFIG.outFiles.concat(parsedConfig.data?.outFiles || []);

				this.config = {
					...DEFAULT_CONFIG,
					...parsedConfig.data,
					outFiles: Array.from(new Set(_outFiles)),
				};
			}
		}

		return this.config;
	}

	public getConfig() {
		return this.config;
	}
}
