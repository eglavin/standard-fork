import { resolve } from "node:path";
import { constants, accessSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import conventionalChangelog from "conventional-changelog";
import type { ForkConfigOptions } from "./configuration.js";
import type { BumpVersion } from "./version.js";

type CreateChangelog = {
	path: string;
	exists: boolean;
};

function createChangelog(options: ForkConfigOptions): CreateChangelog {
	const changelogPath = resolve(options.changelog);

	try {
		accessSync(changelogPath, constants.F_OK);
	} catch (err) {
		if (!options.dryRun && (err as { code: string }).code === "ENOENT") {
			options.log(`Creating Changelog file: ${changelogPath}`);

			writeFileSync(changelogPath, "\n", "utf8");
		}
	}

	return {
		path: changelogPath,
		exists: existsSync(changelogPath),
	};
}

/**
 * Matches the following formats:
 * @example
 * `## [0.0.0]` or `<a name="0.0.0"></a>`
 */
const RELEASE_PATTERN = /(^#+ \[?[0-9]+\.[0-9]+\.[0-9]+|<a name=)/m;

/**
 * Gets the rest of the changelog from the latest release onwards.
 * @see {@link RELEASE_PATTERN}
 */
function getOldReleaseContent(changelog: CreateChangelog): string {
	if (changelog.exists) {
		const fileContents = readFileSync(changelog.path, "utf-8");
		const oldContentStart = fileContents.search(RELEASE_PATTERN);

		if (oldContentStart !== -1) {
			return fileContents.substring(oldContentStart);
		}
	}

	return "";
}

function getNewReleaseContent(
	options: ForkConfigOptions,
	bumpResult: BumpVersion,
): Promise<string> {
	return new Promise<string>((resolve) => {
		let newContent = "";

		conventionalChangelog(
			{
				preset: {
					name: "conventionalcommits",
					...(options.changelogPresetConfig || {}),
				},
				tagPrefix: options.tagPrefix,
				warn: (...message: string[]) => options.error("conventional-changelog: ", ...message),
				cwd: options.changePath,
			},
			{
				version: bumpResult.nextVersion,
			},
			{
				merges: null,
				path: options.changePath,
			},
		)
			.on("error", (error) => {
				options.error("conventional-changelog: Unable to parse changes");
				throw error;
			})
			.on("data", (chunk) => {
				newContent += chunk.toString();
			})
			.on("end", () => {
				resolve(newContent);
			});
	});
}

type UpdateChangelog = {
	changelog: CreateChangelog;
	oldContent: string;
	newContent: string;
};

export async function updateChangelog(
	options: ForkConfigOptions,
	bumpResult: BumpVersion,
): Promise<UpdateChangelog> {
	if (options.header.search(RELEASE_PATTERN) !== -1) {
		// Need to ensure the header doesn't contain the release pattern
		throw new Error("Header cannot contain release pattern");
	}

	const changelog = createChangelog(options);
	const oldContent = getOldReleaseContent(changelog);
	const newContent = await getNewReleaseContent(options, bumpResult);

	options.log(`Updating Changelog:
\t${changelog.path}`);

	if (!options.dryRun && newContent) {
		writeFileSync(changelog.path, `${options.header}\n${newContent}\n${oldContent}`, "utf8");
	}

	return {
		changelog,
		oldContent,
		newContent,
	};
}
