import { resolve, extname } from "node:path";
import { existsSync, readFileSync, writeFileSync, lstatSync } from "node:fs";
import gitSemverTags from "git-semver-tags";
import semver, { ReleaseType } from "semver";
import conventionalRecommendedBump from "conventional-recommended-bump";
import detectIndent from "detect-indent";
import detectNewLine from "detect-newline";
import { stringifyPackage } from "../libs/stringify-package.js";
import type { ForkConfig } from "../configuration.js";

type FileState = {
	name: string;
	path: string;
	type: "package-file" | ({} & string); // eslint-disable-line @typescript-eslint/ban-types
	version: string;
	isPrivate: boolean;
};

function getFile(options: ForkConfig, fileToGet: string): FileState | undefined {
	try {
		const fileExtension = extname(fileToGet);
		if (fileExtension === ".json") {
			const filePath = resolve(options.changePath, fileToGet);
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
					options.log(`Unable to find version in file: ${fileToGet}`);
				}
			}
		}
	} catch (error) {
		options.error(`Error reading file: ${fileToGet}`, error);
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

type CurrentVersion = {
	currentVersion: string;
	files: FileState[];
};

/**
 * Get the current version from the given files and find their locations.
 */
async function getCurrentVersion(options: ForkConfig): Promise<CurrentVersion> {
	const files: FileState[] = [];
	const versions: string[] = [];

	for (const file of options.outFiles) {
		const fileState = getFile(options, file);
		if (fileState) {
			files.push(fileState);

			if (options.currentVersion) {
				continue;
			}

			if (!versions.includes(fileState.version)) {
				versions.push(fileState.version);
			}
		}
	}

	if (options.currentVersion) {
		versions.push(options.currentVersion);
	}

	if (versions.length === 0) {
		if (options.gitTagFallback) {
			const version = await getLatestGitTagVersion(options.tagPrefix);
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

/**
 * Get the priority of given type.
 * @example
 * - "patch" => 0
 * - "minor" => 1
 * - "major" => 2
 */
function getPriority(type?: string): number {
	return ["patch", "minor", "major"].indexOf(type || "");
}

/**
 * Get the given versions highest state.
 * @example
 * - "patch"
 * - "minor"
 * - "major"
 */
function getVersionType(version: string): "patch" | "minor" | "major" | undefined {
	const parseVersion = semver.parse(version);
	if (parseVersion?.major) {
		return "major";
	} else if (parseVersion?.minor) {
		return "minor";
	} else if (parseVersion?.patch) {
		return "patch";
	}
	return undefined;
}

/**
 * Get the recommended release type for the given version depending on if
 * the user asks for a prerelease with or without a tag.
 */
function getReleaseType(
	releaseType: "major" | "minor" | "patch",
	currentVersion: string,
	preReleaseTag?: string | boolean,
): ReleaseType {
	if (!preReleaseTag) {
		return releaseType;
	}

	if (Array.isArray(semver.prerelease(currentVersion))) {
		const currentReleaseType = getVersionType(currentVersion);

		if (
			currentReleaseType === releaseType ||
			getPriority(currentReleaseType) > getPriority(releaseType)
		) {
			return "prerelease";
		}
	}

	return `pre${releaseType}`;
}

type NextVersion = {
	nextVersion: string;
	level?: number;
	preMajor?: boolean;
	reason?: string;
	releaseType?: ReleaseType;
};

/**
 * Get the next version from the given files.
 */
async function getNextVersion(options: ForkConfig, currentVersion: string): Promise<NextVersion> {
	if (options.nextVersion && semver.valid(options.nextVersion)) {
		return { nextVersion: options.nextVersion };
	}

	const preMajor = semver.lt(currentVersion, "1.0.0");
	const recommendedBump = await conventionalRecommendedBump({
		preset: {
			name: "conventionalcommits",
			...(options.changelogPresetConfig || {}),
			preMajor,
		},
		path: options.changePath,
		tagPrefix: options.tagPrefix,
		cwd: options.changePath,
	});

	if (recommendedBump.releaseType) {
		const releaseType = getReleaseType(
			recommendedBump.releaseType,
			currentVersion,
			options.preReleaseTag,
		);

		return Object.assign(recommendedBump, {
			preMajor,
			releaseType,
			nextVersion:
				semver.inc(
					currentVersion,
					releaseType,
					typeof options.preReleaseTag === "string" ? options.preReleaseTag : undefined,
				) || "",
		});
	}

	throw new Error("Unable to find next version");
}

function updateFile(
	options: ForkConfig,
	fileToUpdate: string,
	type: string,
	nextVersion: string,
): void {
	try {
		if (type === "package-file") {
			if (!lstatSync(fileToUpdate).isFile()) return;

			const fileContents = readFileSync(fileToUpdate, "utf8");
			const indent = detectIndent(fileContents).indent;
			const newline = detectNewLine(fileContents);
			const parsedJson = JSON.parse(fileContents);

			parsedJson.version = nextVersion;
			if (parsedJson.packages && parsedJson.packages[""]) {
				parsedJson.packages[""].version = nextVersion; // package-lock v2 stores version there too
			}

			if (!options.dryRun) {
				writeFileSync(fileToUpdate, stringifyPackage(parsedJson, indent, newline), "utf8");
			}
		}
	} catch (error) {
		options.error("Error writing: ", error);
	}
}

export type BumpVersion = CurrentVersion & NextVersion;

export async function bumpVersion(options: ForkConfig): Promise<BumpVersion> {
	const current = await getCurrentVersion(options);
	const next = await getNextVersion(options, current.currentVersion);

	options.log(`Current version: ${current.currentVersion}
Next version: ${next.nextVersion} (${next.releaseType})
Updating Files: `);

	for (const outFile of current.files) {
		options.log(`\t${outFile.path}`);

		updateFile(options, outFile.path, outFile.type, next.nextVersion);
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
