import semver, { type ReleaseType } from "semver";
import conventionalRecommendedBump from "conventional-recommended-bump";

import type { ForkConfig } from "../config/schema";
import type { IFileManager, FileState } from "../strategies/file-manager";
import { getLatestGitTagVersion } from "../utils/git-tag-version";
import { getReleaseType } from "../utils/release-type";

export interface CurrentVersion {
	version: string;
	files: FileState[];
}

export async function getCurrentVersion(
	config: ForkConfig,
	fileManager: IFileManager,
): Promise<CurrentVersion> {
	const files: FileState[] = [];
	const versions = new Set<string>();

	for (const file of config.bumpFiles) {
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

	if (versions.size === 0) {
		if (config.gitTagFallback) {
			const version = await getLatestGitTagVersion(config.tagPrefix);
			if (version) {
				return {
					files: [],
					version: version,
				};
			}
		}

		throw new Error("Unable to find current version");
	} else if (versions.size > 1) {
		throw new Error("Found multiple versions");
	}

	// If we're just inspecting the version, output the version and exit
	if (config.inspectVersion) {
		console.log(versions.entries().next().value[0]);
		process.exit(0);
	}

	return {
		files,
		version: versions.entries().next().value[0],
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
	currentVersion: string,
): Promise<NextVersion> {
	if (config.nextVersion && semver.valid(config.nextVersion)) {
		return { version: config.nextVersion };
	}

	const isPreMajor = semver.lt(currentVersion, "1.0.0");

	let recommendedBump: Awaited<ReturnType<typeof conventionalRecommendedBump>>;
	try {
		recommendedBump = await conventionalRecommendedBump({
			preset: {
				name: "conventionalcommits",
				...config.changelogPresetConfig,
				preMajor: isPreMajor,
			},
			path: config.workingDirectory,
			tagPrefix: config.tagPrefix,
			cwd: config.workingDirectory,
		});
	} catch (error) {
		throw new Error(`[conventional-recommended-bump] Unable to determine next version`);
	}

	if (recommendedBump.releaseType) {
		const releaseType = getReleaseType(
			recommendedBump.releaseType,
			currentVersion,
			config.preReleaseTag,
		);

		return Object.assign(recommendedBump, {
			preMajor: isPreMajor,
			releaseType,
			version:
				semver.inc(
					currentVersion,
					releaseType,
					typeof config.preReleaseTag === "string" ? config.preReleaseTag : undefined,
				) ?? "",
		} satisfies NextVersion);
	}

	throw new Error("Unable to find next version");
}
