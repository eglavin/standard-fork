import path from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";
import { z } from "zod";
import conventionalChangelogConfigSpec from "conventional-changelog-config-spec";
import type { JSONSchema7 } from "json-schema";

const ForkConfigSchema = z.object({
	/**
	 * The path where the changes should be calculated from.
	 * @default
	 * ```js
	 * process.cwd()
	 * ```
	 */
	changePath: z.string(),
	/**
	 * The name of the changelog file.
	 * @default "CHANGELOG.md"
	 */
	changelog: z.string(),
	/**
	 * Files to be updated.
	 * @default
	 * ```js
	 * ["bower.json", "manifest.json", "npm-shrinkwrap.json", "package-lock.json", "package.json"]
	 * ```
	 */
	outFiles: z.array(z.string()),
	/**
	 * The header to be used in the changelog.
	 * @default
	 * ```markdown
	 * # Changelog
	 *
	 * All notable changes to this project will be documented in this file. See [fork-version](https://github.com/eglavin/fork-version) for commit guidelines.
	 * ```
	 */
	header: z.string(),
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
	 * Commit all staged changes, not just files updated by fork-version.
	 * @default false
	 */
	commitAll: z.boolean(),
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
	 * Should we sign the git commit using GPG?
	 * @see {@link https://git-scm.com/docs/git-commit#Documentation/git-commit.txt--Sltkeyidgt GPG Sign Commits}
	 * @default false
	 */
	sign: z.boolean(),
	/**
	 * If true, no output will be written to stdout.
	 * @default false
	 */
	silent: z.boolean(),
	/**
	 * If true, allow git to run git commit hooks.
	 * @default false
	 */
	verify: z.boolean(),

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
	 * Override the default conventional-changelog preset configuration.
	 */
	changelogPresetConfig: z.object({
		/**
		 * An array of `type` objects representing the explicitly supported commit message types, and whether they should show up in generated `CHANGELOG`s.
		 */
		types: z
			.array(
				z.object({
					type: z.string(),
					section: z.string().optional(),
					hidden: z.boolean().optional(),
				}),
			)
			.optional(),
		/**
		 * A URL representing a specific commit at a hash.
		 */
		commitUrlFormat: z.string().optional(),
		/**
		 * A URL representing the comparison between two git SHAs.
		 */
		compareUrlFormat: z.string().optional(),
		/**
		 * A URL representing the issue format (allowing a different URL format to be swapped in for Gitlab, Bitbucket, etc).
		 */
		issueUrlFormat: z.string().optional(),
		/**
		 * A URL representing the a user's profile URL on GitHub, Gitlab, etc. This URL is used for substituting @bcoe with https://github.com/bcoe in commit messages.
		 */
		userUrlFormat: z.string().optional(),
		/**
		 * A string to be used to format the auto-generated release commit message.
		 */
		releaseCommitMessageFormat: z.string().optional(),
		/**
		 * An array of prefixes used to detect references to issues
		 */
		issuePrefixes: z.array(z.string()).optional(),
	}),
});

export type ForkConfig = z.infer<typeof ForkConfigSchema> & {
	/**
	 * Log function, can be used to override the default `console.log` function
	 * to log to a file or another service.
	 * @default console.log
	 */
	log: (...args: unknown[]) => void;
	/**
	 * Error logger function, can be used to override the default `console.error`
	 * function to log to a file or another service.
	 * @default console.error
	 */
	error: (...args: unknown[]) => void;
	/**
	 * Debug logger function, by default this is a noop function, but can be replaced
	 * with a custom logger function or `console.info` to print output.
	 * @default  () => {}
	 */
	debug: (...args: unknown[]) => void;
};

const DEFAULT_CONFIG: ForkConfig = {
	changePath: process.cwd(),
	changelog: "CHANGELOG.md",
	outFiles: [
		"bower.json",
		"manifest.json", // Chrome extensions
		"npm-shrinkwrap.json",
		"package-lock.json",
		"package.json",
	],
	header:
		"# Changelog\n\nAll notable changes to this project will be documented in this file. See [fork-version](https://github.com/eglavin/fork-version) for commit guidelines.\n",
	tagPrefix: "v",

	commitAll: false,
	dryRun: false,
	gitTagFallback: true,
	sign: false,
	silent: false,
	verify: false,

	changelogPresetConfig: {},

	log: console.log, // eslint-disable-line no-console
	error: console.error, // eslint-disable-line no-console
	debug: () => {},
};

export function defineConfig(config: Partial<ForkConfig>): Partial<ForkConfig> {
	const parsedConfig = ForkConfigSchema.partial().safeParse(config);
	if (parsedConfig.success) {
		return parsedConfig.data;
	}
	return DEFAULT_CONFIG;
}

function getPresetDefaults(usersChangelogPresetConfig?: ForkConfig["changelogPresetConfig"]) {
	const preset: { name: string; [_: string]: unknown } = {
		name: "conventionalcommits",
	};

	// First take any default values from the conventional-changelog-config-spec
	if (typeof conventionalChangelogConfigSpec.properties === "object") {
		Object.entries(conventionalChangelogConfigSpec.properties).forEach(([key, value]) => {
			const _value = value as JSONSchema7;
			if ("default" in _value && _value.default !== undefined) {
				preset[key] = _value.default;
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
			// Allow users to add additional outFiles
			const mergedOutFiles = DEFAULT_CONFIG.outFiles.concat(parsedConfig.data?.outFiles || []);

			const usersConfig = Object.assign(DEFAULT_CONFIG, parsedConfig.data, {
				outFiles: Array.from(new Set(mergedOutFiles)),
			});

			if (usersConfig.silent) {
				usersConfig.log = () => {};
				usersConfig.error = () => {};
			}

			// Allow users to override the default log function
			if ("debug" in parsedConfig && typeof parsedConfig.debug === "function") {
				usersConfig.debug = parsedConfig.debug as ForkConfig["debug"];
			}

			return Object.assign(usersConfig, {
				changelogPresetConfig: getPresetDefaults(usersConfig?.changelogPresetConfig),
			});
		}
	}

	return Object.assign(DEFAULT_CONFIG, {
		changelogPresetConfig: getPresetDefaults(),
	});
}
