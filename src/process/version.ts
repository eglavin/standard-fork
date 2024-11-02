import semver, { type ReleaseType } from "semver";
import conventionalRecommendedBump from "conventional-recommended-bump";

import { getLatestGitTagVersion } from "../utils/git-tag-version.js";
import { getReleaseType } from "../utils/release-type.js";
import type { ForkConfig } from "../config/types.js";
import type { FileManager, FileState } from "../strategies/file-manager.js";
import type { Logger } from "../utils/logger.js";

export interface CurrentVersion {
	version: string;
	files: FileState[];
}

export async function getCurrentVersion(
	config: ForkConfig,
	logger: Logger,
	fileManager: FileManager,
	filesToUpdate: string[],
): Promise<CurrentVersion> {
	const files: FileState[] = [];
	const versions = new Set<string>();

	for (const file of filesToUpdate) {
		const fileState = fileManager.read(file);

		if (fileState) {
			files.push(fileState);

			if (config.currentVersion) {
				continue;
			}

			versions.add(fileState.version);
		}
	}

	if (config.currentVersion) {
		versions.add(config.currentVersion);
	}

	// If we still don't have a version, try to get the latest git tag
	if (versions.size === 0 && config.gitTagFallback) {
		const version = await getLatestGitTagVersion(config.tagPrefix);
		if (version) {
			logger.log(`[Version] Using git tag fallback.`);
			versions.add(version);
		}
	}

	if (versions.size === 0) {
		throw new Error("Unable to find current version");
	} else if (versions.size > 1) {
		if (!config.allowMultipleVersions) {
			throw new Error("Found multiple versions");
		}
		logger.warn("[WARNING] Found multiple versions, using the first one.");
		logger.log(`Versions: ${Array.from(versions).join(", ")}`);
	}

	const currentVersion = semver.rsort(Array.from(versions))[0];

	// If we're just inspecting the version, output the version and exit
	if (config.inspectVersion) {
		console.log(currentVersion);
		process.exit(0);
	}

	logger.log(`Current version: ${currentVersion}`);
	return {
		files,
		version: currentVersion,
	};
}

export interface NextVersion {
	version: string;
	level?: number;
	preMajor?: boolean;
	reason?: string;
	releaseType?: ReleaseType;
}

export async function getNextVersion(
	config: ForkConfig,
	logger: Logger,
	currentVersion: string,
): Promise<NextVersion> {
	if (config.skipBump) {
		logger.log("Skip bump, using current version as next version");
		return {
			version: currentVersion,
		};
	}

	if (config.nextVersion && semver.valid(config.nextVersion)) {
		logger.log(`Next version: ${config.nextVersion}`);
		return {
			version: config.nextVersion,
		};
	}

	const isPreMajor = semver.lt(currentVersion, "1.0.0");

	let recommendedBump: Awaited<ReturnType<typeof conventionalRecommendedBump>>;
	try {
		if (config.releaseAs) {
			recommendedBump = {
				releaseType: config.releaseAs,
				level: -1,
				reason: "User defined",
			};
		} else {
			recommendedBump = await conventionalRecommendedBump({
				preset: {
					name: "conventionalcommits",
					...config.changelogPresetConfig,
					preMajor: isPreMajor,
				},
				path: config.path,
				tagPrefix: config.tagPrefix,
				cwd: config.path,
			});
		}
	} catch (_error) {
		throw new Error(`[conventional-recommended-bump] Unable to determine next version`);
	}

	if (recommendedBump.releaseType) {
		const releaseType = getReleaseType(
			recommendedBump.releaseType,
			currentVersion,
			config.preRelease,
		);

		const state: NextVersion = {
			...recommendedBump,
			preMajor: isPreMajor,
			releaseType,
			version:
				semver.inc(
					currentVersion,
					releaseType,
					typeof config.preRelease === "string" ? config.preRelease : undefined,
				) ?? "",
		};

		logger.log(`Next version: ${state.version} (${state.releaseType})`);
		return state;
	}

	throw new Error("Unable to find next version");
}
