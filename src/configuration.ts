import path from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";
import { z } from "zod";

const ForkConfigSchema = z.object({
	/**
	 * The name of the changelog file.
	 * @default "CHANGELOG.md"
	 */
	changelog: z.string(),
	/**
	 * Files to be updated.
	 * @default
	 * ```js
	 * ["package.json", "package-lock.json"]
	 * ```
	 */
	outFiles: z.array(z.string()),
	/**
	 * The path where the changes should be calculated from.
	 * @default
	 * ```js
	 * process.cwd()
	 * ```
	 */
	changePath: z.string(),

	/**
	 * The header to be used in the changelog.
	 * @default
	 * ```markdown
	 * # Changelog
	 *
	 * All notable changes to this project will be documented in this file. See [standard-fork](https://github.com/eglavin/standard-fork) for commit guidelines.
	 * ```
	 */
	header: z.string(),

	/**
	 * If set, we'll use this version number instead of trying to find it in an `outFiles`.
	 * @example "1.0.0"
	 * @default undefined
	 */
	currentVersion: z.string().optional(),
	/**
	 * If set, we'll attempt to update the version number to this version.
	 * @example "2.0.0"
	 * @default undefined
	 */
	nextVersion: z.string().optional(),

	/**
	 * Specify a prefix for the git tag that will be taken into account during the comparison.
	 *
	 * For instance if your version tag is prefixed by `version/` instead of `v` you would
	 * have to specify `tagPrefix: "version/"`.
	 * @default `v`
	 */
	tagPrefix: z.string(),
	/**
	 * Make a pre-release with optional label to specify a tag id.
	 * @example true, "alpha", "beta", "rc", etc.
	 * @default undefined
	 */
	preReleaseTag: z.string().or(z.boolean()).optional(),

	/**
	 * If true, no output will be written to disk or committed.
	 * @default false
	 */
	dryRun: z.boolean(),
	/**
	 * If true and we cant find a version in an `outFiles`, we'll fallback and attempt
	 * to use the latest git tag for the current version.
	 * @default true
	 */
	gitTagFallback: z.boolean(),
	/**
	 * If true, no output will be written to stdout.
	 * @default false
	 */
	silent: z.boolean(),
});

export type ForkConfigOptions = z.infer<typeof ForkConfigSchema>;

const DEFAULT_CONFIG: ForkConfigOptions = {
	changelog: "CHANGELOG.md",
	outFiles: ["package.json", "package-lock.json"],
	header:
		"# Changelog\n\nAll notable changes to this project will be documented in this file. See [standard-fork](https://github.com/eglavin/standard-fork) for commit guidelines.\n",
	changePath: process.cwd(),

	tagPrefix: "v",

	dryRun: false,
	gitTagFallback: true,
	silent: false,
};

export function defineConfig(config: Partial<ForkConfigOptions>): Partial<ForkConfigOptions> {
	const parsedConfig = ForkConfigSchema.partial().safeParse(config);
	if (parsedConfig.success) {
		return parsedConfig.data;
	}
	return DEFAULT_CONFIG;
}

export async function getForkConfig(): Promise<ForkConfigOptions> {
	const cwd = process.cwd();

	const joycon = new JoyCon.default();
	const configPath = await joycon.resolve({
		files: ["fork.config.js"],
		cwd: cwd,
		stopDir: path.parse(cwd).root,
	});

	if (configPath) {
		const foundConfig = await bundleRequire({ filepath: configPath });
		const parsedConfig = ForkConfigSchema.partial().safeParse(
			foundConfig.mod.default || foundConfig.mod,
		);

		if (parsedConfig.success) {
			const mergedOutFiles = DEFAULT_CONFIG.outFiles.concat(parsedConfig.data?.outFiles || []);

			return Object.assign({}, DEFAULT_CONFIG, parsedConfig.data, {
				outFiles: Array.from(new Set(mergedOutFiles)),
			});
		}
	}

	return DEFAULT_CONFIG;
}
