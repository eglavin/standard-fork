import { z } from "zod";

const ChangelogPresetConfigTypeSchema = z.object({
	/**
	 * The type of commit message.
	 * @example "feat", "fix", "chore", etc..
	 */
	type: z.string().describe('The type of commit message, such as "feat", "fix", "chore".'),
	/**
	 * The section of the `CHANGELOG` the commit should show up in.
	 */
	section: z
		.string()
		.optional()
		.describe("The section of the `CHANGELOG` the commit should show up in."),
	/**
	 * Should show in the generated changelog message?
	 */
	hidden: z.boolean().optional().describe("Should show in the generated changelog message?"),
});

export const ChangelogPresetConfigSchema = z.object({
	/**
	 * List of explicitly supported commit message types.
	 */
	types: z
		.array(ChangelogPresetConfigTypeSchema)
		.describe("List of explicitly supported commit message types."),
	/**
	 * A URL representing a specific commit at a hash.
	 * @default "{{host}}/{{owner}}/{{repository}}/commit/{{hash}}"
	 */
	commitUrlFormat: z.string().describe("A URL representing a specific commit at a hash."),
	/**
	 * A URL representing the comparison between two git SHAs.
	 * @default "{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}"
	 */
	compareUrlFormat: z.string().describe("A URL representing the comparison between two git SHAs."),
	/**
	 * A URL representing the issue format (allowing a different URL format to be swapped in
	 * for Gitlab, Bitbucket, etc).
	 * @default "{{host}}/{{owner}}/{{repository}}/issues/{{id}}"
	 */
	issueUrlFormat: z.string().describe("A URL representing the issue format."),
	/**
	 * A URL representing a user's profile on GitHub, Gitlab, etc. This URL is used
	 * for substituting @eglavin with https://github.com/eglavin in commit messages.
	 * @default "{{host}}/{{user}}"
	 */
	userUrlFormat: z.string().describe("A URL representing a user's profile on GitHub, Gitlab, etc."),
	/**
	 * A string to be used to format the auto-generated release commit message.
	 * @default "chore(release): {{currentTag}}"
	 */
	releaseCommitMessageFormat: z
		.string()
		.describe("A string to be used to format the auto-generated release commit message."),
	/**
	 * List of prefixes used to detect references to issues.
	 * @default ["#"]
	 */
	issuePrefixes: z
		.array(z.string())
		.describe("List of prefixes used to detect references to issues."),
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
	path: z.string().describe('The path fork-version will run from. Defaults to "process.cwd()".'),
	/**
	 * Name of the changelog file.
	 * @default "CHANGELOG.md"
	 */
	changelog: z.string().describe('Name of the changelog file. Defaults to "CHANGELOG.md".'),
	/**
	 * The header to be used in the changelog.
	 * @default
	 * ```markdown
	 * # Changelog
	 *
	 * All notable changes to this project will be documented in this file. See [fork-version](https://github.com/eglavin/fork-version) for commit guidelines.
	 * ```
	 */
	header: z.string().describe("The header to be used in the changelog."),
	/**
	 * List of the files to be updated.
	 * @default
	 * ```js
	 * ["bower.json", "manifest.json", "npm-shrinkwrap.json", "package-lock.json", "package.json"]
	 * ```
	 */
	files: z.array(z.string()).describe("List of the files to be updated."),
	/**
	 * Specify a prefix for the tag fork-version will create.
	 *
	 * For instance if your version tag is prefixed by "version/" instead of "v" you have to specify
	 * `tagPrefix: "version/"`.
	 *
	 * `tagPrefix` can also be used for a monorepo environment where you might want to deploy
	 * multiple package from the same repository. In this case you can specify a prefix for
	 * each package:
	 *
	 * | Example Value            | Tag Created                   |
	 * |:-------------------------|:------------------------------|
	 * | ""                       | `1.2.3`                       |
	 * | "version/"               | `version/1.2.3`               |
	 * | "@eglavin/fork-version-" | `@eglavin/fork-version-1.2.3` |
	 *
	 * @example "", "version/", "@eglavin/fork-version-"
	 * @default "v"
	 */
	tagPrefix: z
		.string()
		.describe('Specify a prefix for the tag fork-version will create. Defaults to "v".'),
	/**
	 * Make a pre-release with an optional label, if value is a string it will be used as the
	 * pre-release tag.
	 *
	 * | Example Value | Produced Version |
	 * |:--------------|:-----------------|
	 * | true          | `1.2.3-0`        |
	 * | "alpha"       | `1.2.3-alpha-0`  |
	 * | "beta"        | `1.2.3-beta-0`   |
	 *
	 * @example true, "alpha", "beta", "rc"
	 * @default undefined
	 */
	preReleaseTag: z
		.string()
		.or(z.boolean())
		.optional()
		.describe("Make a pre-release with an optional label."),

	/**
	 * If true, we'll commit all changes, not just files updated by fork-version.
	 * @default false
	 */
	commitAll: z
		.boolean()
		.describe("If true, we'll commit all changes, not just files updated by fork-version."),
	/**
	 * If true, we'll log debug information.
	 * @default false
	 */
	debug: z.boolean().describe("If true, we'll log debug information."),
	/**
	 * If true, no output will be written to disk or committed.
	 * @default false
	 */
	dryRun: z.boolean().describe("If true, no output will be written to disk or committed."),
	/**
	 * If true and we cant find a version in the list of `files`, we'll fallback
	 * and attempt to use the latest git tag to get the current version.
	 * @default true
	 */
	gitTagFallback: z
		.boolean()
		.describe(
			"Fallback and attempt to use the latest git tag as the current version. Defaults to true.",
		),
	/**
	 * If true, we'll log the current version and exit.
	 * @default false
	 */
	inspectVersion: z.boolean().describe("If true, we'll log the current version and exit."),
	/**
	 * If true, we'll sign the git commit using GPG.
	 * @see {@link https://git-scm.com/docs/git-commit#Documentation/git-commit.txt--Sltkeyidgt Git - GPG Sign Commits}
	 * @default false
	 */
	sign: z.boolean().describe("If true, we'll sign the git commit using GPG."),
	/**
	 * If true, no output will be written to stdout.
	 * @default false
	 */
	silent: z.boolean().describe("If true, no output will be written to stdout."),
	/**
	 * If true, run git commit hooks.
	 * @default false
	 */
	verify: z.boolean().describe("If true, run git commit hooks."),

	/**
	 * If set, we'll use this as the current version.
	 * @example "1.0.0"
	 * @default undefined
	 */
	currentVersion: z.string().optional().describe("If set, we'll use this as the current version"),
	/**
	 * If set, we'll use this as the next version.
	 * @example "2.0.0"
	 * @default undefined
	 */
	nextVersion: z.string().optional().describe("If set, we'll use this as the next version."),

	/**
	 * Override the default "conventional-changelog-conventionalcommits" preset configuration.
	 */
	changelogPresetConfig: ChangelogPresetConfigSchema.partial().describe(
		'Override the default "conventional-changelog-conventionalcommits" preset configuration.',
	),
});

export type ForkConfig = z.infer<typeof ForkConfigSchema>;

export function defineConfig(config: Partial<ForkConfig>): Partial<ForkConfig> {
	return config;
}
