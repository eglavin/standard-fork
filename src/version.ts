import { resolve, extname } from "node:path";
import semver from "semver";
import conventionalRecommendedBump from "conventional-recommended-bump";
import { ForkConfigOptions } from "./configuration.js";
import type { FileSystem } from "./file-system.js";

function getCurrentVersion(
	options: ForkConfigOptions,
	fs: FileSystem,
): {
	files: string[];
	version: string;
} {
	const files: string[] = [];
	const versions: string[] = [];

	for (const file of options.outFiles) {
		try {
			switch (extname(file)) {
				case ".json": {
					const filePath = resolve(process.cwd(), file);
					if (fs.exists(filePath)) {
						files.push(filePath);

						if (options.currentVersion) {
							continue;
						}

						const fileContents = JSON.parse(fs.read(filePath));

						// Get version property if exists
						if (fileContents.version && !versions.includes(fileContents.version)) {
							versions.push(fileContents.version);
						}
					}
				}
			}
		} catch (error) {
			console.log(`Error reading file: ${file}`, error);
		}
	}

	if (versions.length === 0) {
		throw new Error("Unable to find current version");
	} else if (versions.length > 1) {
		throw new Error("Found multiple versions");
	}

	return {
		files,
		version: versions[0],
	};
}

async function getNextVersion(
	options: ForkConfigOptions,
	currentVersion: string,
): Promise<{
	version: string;

	level?: number;
	reason?: string;
	releaseType?: semver.ReleaseType;
}> {
	if (semver.valid(options.nextVersion)) {
		return {
			version: options.nextVersion as string,
		};
	}

	const recommendedBump = await conventionalRecommendedBump({
		preset: "conventional-changelog-conventionalcommits",
		path: options.changePath,
		tagPrefix: options.tagPrefix,
	});

	if (recommendedBump.releaseType) {
		return Object.assign(recommendedBump, {
			version: semver.inc(currentVersion, recommendedBump.releaseType) || "",
		});
	}

	throw new Error("Unable to find next version");
}

export async function bumpVersion(
	options: ForkConfigOptions,
	fs: FileSystem,
): Promise<{
	current: string;
	next: string;

	files: string[];
	level?: number;
	reason?: string;
	releaseType?: semver.ReleaseType;
}> {
	const current = getCurrentVersion(options, fs);
	const next = await getNextVersion(options, current.version);

	return {
		current: current.version,
		next: next.version,

		files: current.files,
		level: next.level,
		reason: next.reason,
		releaseType: next.releaseType,
	};
}
