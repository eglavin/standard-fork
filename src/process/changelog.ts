import { resolve } from "node:path";
import { writeFileSync, readFileSync } from "node:fs";
import conventionalChangelog from "conventional-changelog";

import { fileExists } from "../utils/file-state";
import type { ForkConfig } from "../config/schema";
import type { Logger } from "../utils/logger";

interface CreateChangelog {
	path: string;
	exists: boolean;
}

function createChangelog(config: ForkConfig, logger: Logger): CreateChangelog {
	const changelogPath = resolve(config.workingDirectory, config.changelog);

	if (!config.dryRun && !fileExists(changelogPath)) {
		logger.log(`Creating Changelog file: ${changelogPath}`);

		writeFileSync(changelogPath, "\n", "utf8");
	}

	return {
		path: changelogPath,
		exists: fileExists(changelogPath),
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
					...(config.changelogPresetConfig || {}),
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
	changelog: CreateChangelog;
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

	const changelog = createChangelog(config, logger);
	const oldContent = getOldReleaseContent(changelog);
	const newContent = await getNewReleaseContent(config, logger, nextVersion);

	logger.log(`Updating Changelog:
\t${changelog.path}`);

	if (!config.dryRun && newContent) {
		writeFileSync(changelog.path, `${config.header}\n${newContent}\n${oldContent}`, "utf8");
	}

	return {
		changelog,
		oldContent,
		newContent,
	};
}
