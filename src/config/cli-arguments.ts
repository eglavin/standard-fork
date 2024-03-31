import meow from "meow";

export function getCliArguments() {
	return meow(
		`
Usage:
  $ fork-version [options]

Options:
  --working-directory [Default: process.cwd()]
    The path fork-version will run from.
  --changelog [Default: "CHANGELOG.md"]
    Name of the changelog file.
  --header, -H
    The header to be used in the changelog.
  --bump-files, --bump-file [Default: ["bower.json", "manifest.json", "npm-shrinkwrap.json", "package-lock.json", "package.json"]]
    Files to be updated.
  --tag-prefix [Default: "v"]
    Specify a prefix for the git tag "fork-version" will create.
  --pre-release-tag [Default: undefined]
    Make a pre-release with optional label, If value is a string it
    will be used as the pre-release tag.

  --commit-all
    Commit all staged changes, not just files updated by fork-version.
  --dry-run
    If true, no output will be written to disk or committed.
  --git-tag-fallback [Default: true]
    If true and we cant find a version in a bumpFiles, we'll fallback
    and attempt to use the latest git tag for the current version.
  --sign
    Should we sign the git commit using GPG?
  --silent
    If true, no output will be written to stdout.
  --verify
    If true, allow git to run git commit hooks.

  --current-version
    If set, we'll use this version number instead of trying to find a
    version in a "bumpFiles".
  --next-version
    If set, we'll attempt to update the version number to this version,
    instead of incrementing using "conventional-commit".
`,
		{
			importMeta: import.meta,
			flags: {
				workingDirectory: { type: "string" },
				changelog: { type: "string" },
				header: { type: "string", shortFlag: "H" },
				bumpFiles: { type: "string", isMultiple: true, aliases: ["bump-file"] },
				tagPrefix: { type: "string" },
				preReleaseTag: { type: "string" },

				commitAll: { type: "boolean" },
				dryRun: { type: "boolean" },
				gitTagFallback: { type: "boolean" },
				sign: { type: "boolean" },
				silent: { type: "boolean" },
				verify: { type: "boolean" },

				currentVersion: { type: "string" },
				nextVersion: { type: "string" },
			},
		},
	);
}
