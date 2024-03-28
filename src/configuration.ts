/* eslint-disable @typescript-eslint/no-empty-function */

import path from "node:path";
import JoyCon from "joycon";
import { bundleRequire } from "bundle-require";
import { z } from "zod";
import conventionalChangelogConfigSpec from "conventional-changelog-config-spec";
import meow from "meow";

export const ForkConfigSchema = z.object({
	/**
	 * The path fork-version will run from.
	 * @default
	 * ```js
	 * process.cwd()
	 * ```
	 */
	workingDirectory: z.string(),
	/**
	 * Name of the changelog file.
	 * @default "CHANGELOG.md"
	 */
	changelog: z.string(),
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
	 * Files to be updated, Currently only JSON files with a version key are supported.
	 * @default
	 * ```js
	 * ["bower.json", "manifest.json", "npm-shrinkwrap.json", "package-lock.json", "package.json"]
	 * ```
	 */
	bumpFiles: z.array(z.string()),
	/**
	 * Specify a prefix for the git tag fork-version will create.
	 *
	 * For instance if your version tag is prefixed by "version/" instead of "v" you have to specify
	 * `tagPrefix: "version/"`.
	 *
	 * `tagPrefix` can also be used for a monorepo environment where you might want to deploy
	 * multiple package from the same repository. In this case you can specify a prefix for
	 * each package:
	 *
	 * | Value                    | Tag Created                   |
	 * |:-------------------------|:------------------------------|
	 * | ""                       | `1.2.3`                       |
	 * | "version/"               | `version/1.2.3`               |
	 * | "@eglavin/fork-version-" | `@eglavin/fork-version-1.2.3` |
	 *
	 * @example "", "version/", "@eglavin/fork-version-"
	 * @default "v"
	 */
	tagPrefix: z.string(),
	/**
	 * Make a pre-release with optional label, if value is a string it will be used as the
	 * pre-release tag.
	 *
	 * | Value     | Version         |
	 * |:----------|:----------------|
	 * | true      | "1.2.3-0"       |
	 * | "alpha"   | "1.2.3-alpha-0" |
	 * | "beta"    | "1.2.3-beta-0"  |
	 *
	 * @example true, "alpha", "beta", "rc"
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
	 * If true and we cant find a version in a `bumpFiles`, we'll fallback and attempt to use
	 * the latest git tag for the current version.
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
	 * If set, we'll use this version number instead of trying to find a version in a `bumpFiles`.
	 * @example "1.0.0"
	 * @default undefined
	 */
	currentVersion: z.string().optional(),
	/**
	 * If set, we'll attempt to update the version number to this version, instead of incrementing
	 * using "conventional-commit".
	 * @example "2.0.0"
	 * @default undefined
	 */
	nextVersion: z.string().optional(),

	/**
	 * Override the default conventional-changelog preset configuration.
	 */
	changelogPresetConfig: z.object({
		/**
		 * An array of `type` objects representing the explicitly supported commit message types,
		 * and whether they should show up in generated `CHANGELOG`s.
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
		 * A URL representing the issue format (allowing a different URL format to be swapped in
		 * for Gitlab, Bitbucket, etc).
		 */
		issueUrlFormat: z.string().optional(),
		/**
		 * A URL representing the a user's profile URL on GitHub, Gitlab, etc. This URL is used
		 * for substituting @bcoe with https://github.com/bcoe in commit messages.
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

	/**
	 * Log function, can be used to override the default `console.log` function
	 * to log to a file or another service.
	 * @default console.log
	 */
	log: z.function().args(z.string()).returns(z.void()),
	/**
	 * Error logger function, can be used to override the default `console.error`
	 * function to log to a file or another service.
	 * @default console.error
	 */
	error: z.function().args(z.string()).returns(z.void()),
	/**
	 * Debug logger function, by default this is a noop function, but can be replaced
	 * with a custom logger function or `console.info` to print output.
	 * @default  () => {}
	 */
	debug: z.function().args(z.string()).returns(z.void()),
});

export type ForkConfig = z.infer<typeof ForkConfigSchema>;

const DEFAULT_CONFIG: ForkConfig = {
	workingDirectory: process.cwd(),
	changelog: "CHANGELOG.md",
	bumpFiles: [
		"package.json",
		"package-lock.json",
		"npm-shrinkwrap.json",
		"manifest.json", // Chrome extensions
		"bower.json",
	],
	header: `# Changelog

All notable changes to this project will be documented in this file. See [fork-version](https://github.com/eglavin/fork-version) for commit guidelines.
`,
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

function getCliArguments() {
	return meow(
		`
Usage:
  $ fork-version [options]

Options:
  --workingDirectory [Default: process.cwd()]
    The path fork-version will run from.
  --changelog [Default: "CHANGELOG.md"]
    Name of the changelog file.
  --header, -H
    The header to be used in the changelog.
  --bumpFiles [Default: ["bower.json", "manifest.json", "npm-shrinkwrap.json", "package-lock.json", "package.json"]]
    Files to be updated.
  --tagPrefix [Default: "v"]
    Specify a prefix for the git tag "fork-version" will create.
  --preReleaseTag [Default: undefined]
    Make a pre-release with optional label, If value is a string it will be used as
    the pre-release tag.

  --commitAll
    Commit all staged changes, not just files updated by fork-version.
  --dryRun
    If true, no output will be written to disk or committed.
  --gitTagFallback [Default: true]
    If true and we cant find a version in an bumpFiles, we'll fallback and attempt
    to use the latest git tag for the current version.
  --sign
    Should we sign the git commit using GPG?
  --silent
    If true, no output will be written to stdout.
  --verify
    If true, allow git to run git commit hooks.

  --currentVersion
    If set, we'll use this version number instead of trying to find a version in a
    "bumpFiles".
  --nextVersion
    If set, we'll attempt to update the version number to this version, instead of
    incrementing using "conventional-commit".
`,
		{
			importMeta: import.meta,
			flags: {
				workingDirectory: {
					type: "string",
				},
				changelog: {
					type: "string",
				},
				header: {
					type: "string",
					shortFlag: "H",
				},
				bumpFiles: {
					type: "string",
					isMultiple: true,
				},
				tagPrefix: {
					type: "string",
				},
				preReleaseTag: {
					type: "string",
				},
				commitAll: {
					type: "boolean",
				},
				dryRun: {
					type: "boolean",
				},
				gitTagFallback: {
					type: "boolean",
				},
				sign: {
					type: "boolean",
				},
				silent: {
					type: "boolean",
				},
				verify: {
					type: "boolean",
				},
				currentVersion: {
					type: "string",
				},
				nextVersion: {
					type: "string",
				},
			},
		},
	);
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
