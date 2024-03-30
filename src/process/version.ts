import { resolve, extname } from "node:path";
import { existsSync, readFileSync, writeFileSync, lstatSync } from "node:fs";
import gitSemverTags from "git-semver-tags";
import semver, { type ReleaseType } from "semver";
import conventionalRecommendedBump from "conventional-recommended-bump";
import detectIndent from "detect-indent";
import { detectNewline } from "detect-newline";

import { stringifyPackage } from "../libs/stringify-package";
import { getReleaseType } from "../utils/release-type";
import type { ForkConfig } from "../configuration/schema";
import type { Logger } from "../utils/logger";

interface FileState {
	name: string;
	path: string;
	type: "package-file" | ({} & string); // eslint-disable-line @typescript-eslint/ban-types
	version: string;
	isPrivate: boolean;
}

function getFile(config: ForkConfig, logger: Logger, fileToGet: string): FileState | undefined {
	try {
		const fileExtension = extname(fileToGet);
		if (fileExtension === ".json") {
			const filePath = resolve(config.workingDirectory, fileToGet);
			if (existsSync(filePath)) {
				const fileContents = readFileSync(filePath, "utf8");
				const parsedJson = JSON.parse(fileContents);

				// Return if version property exists
				if (parsedJson.version) {
					return {
						name: fileToGet,
						path: filePath,
						type: "package-file",
						version: parsedJson.version,
						isPrivate:
							"private" in parsedJson &&
							(typeof parsedJson.private === "boolean" ? parsedJson.private : false),
					};
				} else {
					logger.log(`Unable to find version in file: ${fileToGet}`);
				}
			}
		}
	} catch (error) {
		logger.error(`Error reading file: ${fileToGet}`, error);
	}
}

async function getLatestGitTagVersion(tagPrefix: string | undefined): Promise<string> {
	const gitTags = await gitSemverTags({ tagPrefix });
	if (!gitTags.length) {
		return "1.0.0";
	}

	const cleanedTags = [];

	for (const tag of gitTags) {
		const cleanedTag = semver.clean(tag.replace(new RegExp(`^${tagPrefix}`), ""));

		if (cleanedTag) {
			cleanedTags.push(cleanedTag);
		}
	}

	return cleanedTags.sort(semver.rcompare)[0];
}

interface CurrentVersion {
	currentVersion: string;
	files: FileState[];
}

/**
 * Get the current version from the given files and find their locations.
 */
async function getCurrentVersion(config: ForkConfig, logger: Logger): Promise<CurrentVersion> {
	const files: FileState[] = [];
	const versions: string[] = [];

	for (const file of config.bumpFiles) {
		const fileState = getFile(config, logger, file);
		if (fileState) {
			files.push(fileState);

			if (config.currentVersion) {
				continue;
			}

			if (!versions.includes(fileState.version)) {
				versions.push(fileState.version);
			}
		}
	}

	if (config.currentVersion) {
		versions.push(config.currentVersion);
	}

	if (versions.length === 0) {
		if (config.gitTagFallback) {
			const version = await getLatestGitTagVersion(config.tagPrefix);
			if (version) {
				return {
					files: [],
					currentVersion: version,
				};
			}
		}

		throw new Error("Unable to find current version");
	} else if (versions.length > 1) {
		throw new Error("Found multiple versions");
	}

	return {
		files,
		currentVersion: versions[0],
	};
}

interface NextVersion {
	nextVersion: string;
	level?: number;
	preMajor?: boolean;
	reason?: string;
	releaseType?: ReleaseType;
}

/**
 * Get the next version from the given files.
 */
async function getNextVersion(config: ForkConfig, currentVersion: string): Promise<NextVersion> {
	if (config.nextVersion && semver.valid(config.nextVersion)) {
		return { nextVersion: config.nextVersion };
	}

	const preMajor = semver.lt(currentVersion, "1.0.0");
	const recommendedBump = await conventionalRecommendedBump({
		preset: {
			name: "conventionalcommits",
			...(config.changelogPresetConfig || {}),
			preMajor,
		},
		path: config.workingDirectory,
		tagPrefix: config.tagPrefix,
		cwd: config.workingDirectory,
	});

	if (recommendedBump.releaseType) {
		const releaseType = getReleaseType(
			recommendedBump.releaseType,
			currentVersion,
			config.preReleaseTag,
		);

		return Object.assign(recommendedBump, {
			preMajor,
			releaseType,
			nextVersion:
				semver.inc(
					currentVersion,
					releaseType,
					typeof config.preReleaseTag === "string" ? config.preReleaseTag : undefined,
				) ?? "",
		});
	}

	throw new Error("Unable to find next version");
}

function updateFile(
	config: ForkConfig,
	logger: Logger,
	fileToUpdate: string,
	type: string,
	nextVersion: string,
): void {
	try {
		if (type === "package-file") {
			if (!lstatSync(fileToUpdate).isFile()) return;

			const fileContents = readFileSync(fileToUpdate, "utf8");
			const detectedIndentation = detectIndent(fileContents).amount;
			const detectedNewline = detectNewline(fileContents);
			const parsedJson = JSON.parse(fileContents);

			parsedJson.version = nextVersion;
			if (parsedJson.packages?.[""]) {
				parsedJson.packages[""].version = nextVersion; // package-lock v2 stores version there too
			}

			if (!config.dryRun) {
				writeFileSync(
					fileToUpdate,
					stringifyPackage(parsedJson, detectedIndentation, detectedNewline),
					"utf8",
				);
			}
		}
	} catch (error) {
		logger.error("Error writing: ", error);
	}
}

export type BumpVersion = CurrentVersion & NextVersion;

export async function bumpVersion(config: ForkConfig, logger: Logger): Promise<BumpVersion> {
	const current = await getCurrentVersion(config, logger);
	const next = await getNextVersion(config, current.currentVersion);

	logger.log(`Current version: ${current.currentVersion}
Next version: ${next.nextVersion} (${next.releaseType})
Updating Files: `);

	for (const outFile of current.files) {
		logger.log(`\t${outFile.path}`);

		updateFile(config, logger, outFile.path, outFile.type, next.nextVersion);
	}

	return {
		currentVersion: current.currentVersion,
		files: current.files,

		nextVersion: next.nextVersion,
		level: next.level,
		preMajor: next.preMajor,
		reason: next.reason,
		releaseType: next.releaseType,
	};
}
