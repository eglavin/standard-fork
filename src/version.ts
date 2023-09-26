import { resolve, extname } from "node:path";
import { existsSync, readFileSync, writeFileSync, lstatSync } from "node:fs";
import gitSemverTags from "git-semver-tags";
import semver, { ReleaseType } from "semver";
import conventionalRecommendedBump from "conventional-recommended-bump";
import detectIndent from "detect-indent";
import detectNewLine from "detect-newline";
import { stringifyPackage } from "./libs/stringify-package.js";
import type { ForkConfigOptions } from "./configuration.js";

function getFile(options: ForkConfigOptions, fileToGet: string) {
	try {
		switch (extname(fileToGet)) {
			case ".json": {
				const filePath = resolve(options.changePath, fileToGet);
				if (existsSync(filePath)) {
					const fileContents = readFileSync(filePath, "utf8");
					const parsedJson = JSON.parse(fileContents);

					// Return if version property exists
					if (parsedJson.version) {
						return {
							path: filePath,
							version: parsedJson.version,
						};
					}
				}
			}
		}
	} catch (error) {
		console.log(`Error reading file: ${fileToGet}`, error);
	}
}

async function getLatestGitTagVersion(tagPrefix: string | undefined) {
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

/**
 * Get the current version from the given files and find their locations.
 */
async function getCurrentVersion(options: ForkConfigOptions) {
	const files: string[] = [];
	const versions: string[] = [];

	for (const file of options.outFiles) {
		const fileState = getFile(options, file);
		if (fileState) {
			files.push(fileState.path);

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
					version,
				};
			}
		}

		throw new Error("Unable to find current version");
	} else if (versions.length > 1) {
		throw new Error("Found multiple versions");
	}

	return {
		files,
		version: versions[0],
	};
}

/**
 * Get the priority of given type.
 * @example
 * - "patch" => 0
 * - "minor" => 1
 * - "major" => 2
 */
function getPriority(type?: string) {
	return ["patch", "minor", "major"].indexOf(type || "");
}

/**
 * Get the given versions highest state.
 * @example
 * - "patch"
 * - "minor"
 * - "major"
 */
function getVersionType(version: string) {
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

/**
 * Get the next version from the given files.
 */
async function getNextVersion(
	options: ForkConfigOptions,
	currentVersion: string,
): Promise<{
	version: string;

	level?: number;
	preMajor?: boolean;
	reason?: string;
	releaseType?: ReleaseType;
}> {
	if (options.nextVersion && semver.valid(options.nextVersion)) {
		return { version: options.nextVersion };
	}

	const preMajor = semver.lt(currentVersion, "1.0.0");
	const recommendedBump = await conventionalRecommendedBump({
		preset: {
			name: "conventionalcommits",
			preMajor,
		},
		path: options.changePath,
		tagPrefix: options.tagPrefix,
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
			version:
				semver.inc(
					currentVersion,
					releaseType,
					typeof options.preReleaseTag === "string" ? options.preReleaseTag : undefined,
				) || "",
		});
	}

	throw new Error("Unable to find next version");
}

function updateFile(options: ForkConfigOptions, fileToUpdate: string, nextVersion: string) {
	try {
		switch (extname(fileToUpdate)) {
			case ".json": {
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
		}
	} catch (error) {
		console.log(`Error writing file: ${fileToUpdate}`, error);
	}
}

export async function bumpVersion(options: ForkConfigOptions): Promise<{
	current: string;
	next: string;

	files: string[];
	level?: number;
	preMajor?: boolean;
	reason?: string;
	releaseType?: ReleaseType;
}> {
	const current = await getCurrentVersion(options);
	const next = await getNextVersion(options, current.version);

	for (const outFile of current.files) {
		updateFile(options, outFile, next.version);
	}

	return {
		current: current.version,
		next: next.version,

		files: current.files,
		level: next.level,
		preMajor: next.preMajor,
		reason: next.reason,
		releaseType: next.releaseType,
	};
}
