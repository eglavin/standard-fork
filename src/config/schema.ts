import { z } from "zod";

export const ChangelogPresetConfigSchema = z.object({
	/**
	 * An array of `type` objects representing the explicitly supported commit message types,
	 * and whether they should show up in generated `CHANGELOG`s.
	 */
	types: z.array(
		z.object({
			type: z.string(),
			section: z.string().optional(),
			hidden: z.boolean().optional(),
		}),
	),
	/**
	 * A URL representing a specific commit at a hash.
	 * @default "{{host}}/{{owner}}/{{repository}}/commit/{{hash}}"
	 */
	commitUrlFormat: z.string(),
	/**
	 * A URL representing the comparison between two git SHAs.
	 * @default "{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}"
	 */
	compareUrlFormat: z.string(),
	/**
	 * A URL representing the issue format (allowing a different URL format to be swapped in
	 * for Gitlab, Bitbucket, etc).
	 * @default "{{host}}/{{owner}}/{{repository}}/issues/{{id}}"
	 */
	issueUrlFormat: z.string(),
	/**
	 * A URL representing the a user's profile URL on GitHub, Gitlab, etc. This URL is used
	 * for substituting @bcoe with https://github.com/bcoe in commit messages.
	 * @default "{{host}}/{{user}}"
	 */
	userUrlFormat: z.string(),
	/**
	 * A string to be used to format the auto-generated release commit message.
	 * @default "chore(release): {{currentTag}}"
	 */
	releaseCommitMessageFormat: z.string(),
	/**
	 * An array of prefixes used to detect references to issues
	 * @default ["#"]
	 */
	issuePrefixes: z.array(z.string()),
});

export type ChangelogPresetConfig = z.infer<typeof ChangelogPresetConfigSchema>;

export const ForkConfigSchema = z.object({
	/**
	 * The path fork-version will run from.
	 * @default
	 * ```js
	 * process.cwd()
	 * ```
	 */
	path: z.string(),
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
	 * Files to be updated.
	 * @default
	 * ```js
	 * ["bower.json", "manifest.json", "npm-shrinkwrap.json", "package-lock.json", "package.json"]
	 * ```
	 */
	files: z.array(z.string()),
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
	 * If set we'll log debug information.
	 * @default false
	 */
	debug: z.boolean(),
	/**
	 * If true, no output will be written to disk or committed.
	 * @default false
	 */
	dryRun: z.boolean(),
	/**
	 * If true and we cant find a version in the list of `files`, we'll fallback
	 * and attempt to use the latest git tag to get the current version.
	 * @default true
	 */
	gitTagFallback: z.boolean(),
	/**
	 * If set, we'll gather information about the current version and exit.
	 * @default false
	 */
	inspectVersion: z.boolean(),
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
	 * If set, we'll use this version number instead of trying to find a version from the list of `files`.
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
	changelogPresetConfig: ChangelogPresetConfigSchema.partial(),
});

export type ForkConfig = z.infer<typeof ForkConfigSchema>;

export function defineConfig(config: Partial<ForkConfig>): Partial<ForkConfig> {
	return config;
}
