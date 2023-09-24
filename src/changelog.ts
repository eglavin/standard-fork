import { constants, accessSync, writeFileSync, readFileSync } from "fs";
import type { ForkConfigOptions } from "./configuration.js";
import { resolve } from "path";

function createChangelog(options: ForkConfigOptions) {
	const changelogPath = resolve(options.changelog);

	try {
		accessSync(changelogPath, constants.F_OK);
	} catch (err) {
		if (!options.dry && (err as { code: string }).code === "ENOENT") {
			console.log(`Creating Changelog: ${changelogPath}`);

			writeFileSync(changelogPath, "\n");
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
function getOldReleaseContent(changelogPath: string) {
	const fileContents = readFileSync(changelogPath, "utf-8");
	const oldContentStart = fileContents.search(RELEASE_PATTERN);

	if (oldContentStart !== -1) {
		return fileContents.substring(oldContentStart);
	}
	return "";
}

export async function updateChangelog(options: ForkConfigOptions) {
	if (options.header?.search(RELEASE_PATTERN)) {
		throw new Error("Header cannot contain release pattern"); // Need to ensure the header doesn't contain the release pattern
	}

	const changelogPath = createChangelog(options);
	const oldContent = getOldReleaseContent(changelogPath);

	return {
		changelogPath,
		oldContent,
	};
}
