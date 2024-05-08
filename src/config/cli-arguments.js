import meow from "meow";
//@ts-check

// This file is javascript so the following helper text can be extracted to the readme
// without the need for a build step, otherwise it would also be typescript...

export const helperText = `Usage:
  $ fork-version [options]

Commands:
  --help                Show this help message.
  --version             Show the current version of fork-version.
  --inspect-version     If set, fork-version will print the current project version and exit.

Options:
  --file, -F            List of the files to be updated. [Default: ["bower.json", "manifest.json", "npm-shrinkwrap.json", "package-lock.json", "package.json"]]
  --glob, -G            Glob pattern to match files to be updated.
  --path, -P            The path fork-version will run from. [Default: process.cwd()]
  --changelog           Name of the changelog file. [Default: "CHANGELOG.md"]
  --header              The header text for the changelog.
  --tag-prefix          Specify a prefix for the created tag. [Default: "v"]
  --pre-release         Mark this release as a pre-release.
  --pre-release-tag     Mark this release with a tagged pre-release. [Example: "alpha", "beta", "rc"]
  --current-version     If set, fork-version will use this version instead of trying to determine one.
  --next-version        If set, fork-version will attempt to update to this version, instead of incrementing using "conventional-commit".

Flags:
  --commit-all          Commit all changes, not just files updated by fork-version.
  --debug               Output debug information.
  --dry-run             No output will be written to disk or committed.
  --silent              Run without logging to the terminal.
  --git-tag-fallback    If unable to find a version in the given files, fallback and attempt to use the latest git tag. [Default: true]
  --sign                If true, git will sign the commit with the systems GPG key.
  --verify              If true, git will run user defined git hooks before committing.

  To negate a flag you can prefix it with "no-", for example "--no-git-tag-fallback" will not fallback to the latest git tag.

Examples:
  $ fork-version
    Run fork-version in the current directory with default options.

  $ fork-version --path ./packages/my-package
    Run fork-version in the "./packages/my-package" directory.

  $ fork-version --file package.json --file MyApi.csproj
    Run fork-version and update the "package.json" and "MyApi.csproj" files.

  $ fork-version --glob "*/package.json"
    Run fork-version and update all "package.json" files in subdirectories.`;

export function getCliArguments() {
	return meow(helperText, {
		importMeta: import.meta,
		booleanDefault: undefined,
		helpIndent: 0,
		flags: {
			// Commands
			inspectVersion: { type: "boolean" },

			// Options
			files: { type: "string", isMultiple: true, aliases: ["file"], shortFlag: "F" },
			glob: { type: "string", shortFlag: "G" },
			path: { type: "string", shortFlag: "P" },
			changelog: { type: "string" },
			header: { type: "string" },
			tagPrefix: { type: "string" },
			preRelease: { type: "boolean" },
			preReleaseTag: { type: "string" },
			currentVersion: { type: "string" },
			nextVersion: { type: "string" },

			// Flags
			commitAll: { type: "boolean" },
			debug: { type: "boolean" },
			dryRun: { type: "boolean" },
			silent: { type: "boolean" },
			gitTagFallback: { type: "boolean" },
			sign: { type: "boolean" },
			verify: { type: "boolean" },
		},
	});
}
