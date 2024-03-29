import { resolve } from "node:path";
import { constants, accessSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import conventionalChangelog from "conventional-changelog";
import type { ForkConfig } from "../configuration/schema.js";
import type { BumpVersion } from "./version.js";
import type { Logger } from "../utils/logger.js";

interface CreateChangelog {
	path: string;
	exists: boolean;
}

function createChangelog(config: ForkConfig, logger: Logger): CreateChangelog {
	const changelogPath = resolve(config.changelog);

	try {
		accessSync(changelogPath, constants.F_OK);
	} catch (err) {
		if (!config.dryRun && (err as { code: string }).code === "ENOENT") {
			logger.log(`Creating Changelog file: ${changelogPath}`);

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
	config: ForkConfig,
	logger: Logger,
	bumpResult: BumpVersion,
): Promise<string> {
	return new Promise<string>((resolve) => {
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
				version: bumpResult.nextVersion,
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
				resolve(newContent);
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
	bumpResult: BumpVersion,
): Promise<UpdateChangelog> {
	if (config.header.search(RELEASE_PATTERN) !== -1) {
		// Need to ensure the header doesn't contain the release pattern
		throw new Error("Header cannot contain release pattern");
	}

	const changelog = createChangelog(config, logger);
	const oldContent = getOldReleaseContent(changelog);
	const newContent = await getNewReleaseContent(config, logger, bumpResult);

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
