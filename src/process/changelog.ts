import { resolve } from "node:path";
import { writeFileSync, readFileSync } from "node:fs";
import conventionalChangelog from "conventional-changelog";

import { fileExists } from "../utils/file-state";
import type { ForkConfig } from "../config/schema";
import type { Logger } from "../utils/logger";

/**
 * Matches the following changelog header formats:
 * - `## [1.2.3]`
 * - `<a name="1.2.3"></a>`
 */
const RELEASE_PATTERN = /(^#+ \[?[0-9]+\.[0-9]+\.[0-9]+|<a name=)/m;

/**
 * Get the existing changelog content from the latest release onwards.
 * @see {@link RELEASE_PATTERN}
 */
function getOldReleaseContent(filePath: string, exists: boolean): string {
	if (exists) {
		const fileContents = readFileSync(filePath, "utf-8");
		const oldContentStart = fileContents.search(RELEASE_PATTERN);

		if (oldContentStart !== -1) {
			return fileContents.substring(oldContentStart);
		}
	}

	return "";
}

/**
 * Generate the new changelog content for this release.
 */
function getNewReleaseContent(
	config: ForkConfig,
	logger: Logger,
	nextVersion: string,
): Promise<string> {
	return new Promise<string>((onResolve) => {
		let newContent = "";

		conventionalChangelog(
			{
				preset: {
					name: "conventionalcommits",
					...config.changelogPresetConfig,
				},
				tagPrefix: config.tagPrefix,
				warn: (...message: string[]) => logger.error("conventional-changelog: ", ...message),
				cwd: config.workingDirectory,
			},
			{
				version: nextVersion,
			},
			{
				merges: null,
				path: config.workingDirectory,
			},
		)
			.on("error", (error) => {
				logger.error("conventional-changelog: Unable to parse changes");
				throw error;
			})
			.on("data", (chunk) => {
				newContent += chunk.toString();
			})
			.on("end", () => {
				onResolve(newContent);
			});
	});
}

interface UpdateChangelog {
	changelogPath: string;
	oldContent: string;
	newContent: string;
}

export async function updateChangelog(
	config: ForkConfig,
	logger: Logger,
	nextVersion: string,
): Promise<UpdateChangelog> {
	if (config.header.search(RELEASE_PATTERN) !== -1) {
		// Need to ensure the header doesn't contain the release pattern
		throw new Error("Header cannot contain release pattern");
	}

	// Create the changelog file if it doesn't exist
	const changelogPath = resolve(config.workingDirectory, config.changelog);
	if (!config.dryRun && !fileExists(changelogPath)) {
		logger.log(`Creating Changelog file: ${changelogPath}`);
		writeFileSync(changelogPath, "\n", "utf8");
	}

	const oldContent = getOldReleaseContent(changelogPath, fileExists(changelogPath));
	const newContent = await getNewReleaseContent(config, logger, nextVersion);

	logger.log(`Updating Changelog: ${changelogPath}`);
	if (!config.dryRun && newContent) {
		writeFileSync(
			changelogPath,
			`${config.header}
${newContent}
${oldContent}
`,
			"utf8",
		);
	}

	return {
		changelogPath,
		oldContent,
		newContent,
	};
}
