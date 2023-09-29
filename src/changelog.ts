import { resolve } from "node:path";
import { constants, accessSync, writeFileSync, readFileSync } from "node:fs";
import conventionalChangelog from "conventional-changelog";
import type { ForkConfigOptions } from "./configuration.js";
import type { BumpVersion } from "./version.js";

function createChangelog(options: ForkConfigOptions): string {
	const changelogPath = resolve(options.changelog);

	try {
		accessSync(changelogPath, constants.F_OK);
	} catch (err) {
		if (!options.dryRun && (err as { code: string }).code === "ENOENT") {
			options.log(`Creating Changelog: ${changelogPath}`);

			writeFileSync(changelogPath, "\n", "utf8");
		}
	}

	return changelogPath;
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
function getOldReleaseContent(changelogPath: string): string {
	const fileContents = readFileSync(changelogPath, "utf-8");
	const oldContentStart = fileContents.search(RELEASE_PATTERN);

	if (oldContentStart !== -1) {
		return fileContents.substring(oldContentStart);
	}
	return "";
}

function getChanges(options: ForkConfigOptions, bumpResult: BumpVersion): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		let newContent = "";

		conventionalChangelog(
			{
				preset: {
					name: "conventionalcommits",
					...(options.changelogPresetConfig || {}),
				},
				tagPrefix: options.tagPrefix,
				warn: (...message: string[]) => options.log("conventional-changelog: ", ...message),
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
				reject("");
				throw new Error("Unable to generate changelog", error);
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
	changelogPath: string;
	oldContent: string;
	newContent: string;
};

export async function updateChangelog(
	options: ForkConfigOptions,
	bumpResult: BumpVersion,
): Promise<UpdateChangelog> {
	if (options.header.search(RELEASE_PATTERN) !== -1) {
		throw new Error("Header cannot contain release pattern"); // Need to ensure the header doesn't contain the release pattern
	}

	const changelogPath = createChangelog(options);
	const oldContent = getOldReleaseContent(changelogPath);
	const newContent = await getChanges(options, bumpResult);

	if (!options.dryRun) {
		writeFileSync(changelogPath, `${options.header}\n${newContent}\n${oldContent}`, "utf8");
	}

	return {
		changelogPath,
		oldContent,
		newContent,
	};
}
