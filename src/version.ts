import { resolve, extname } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import semver, { ReleaseType } from "semver";
import conventionalRecommendedBump from "conventional-recommended-bump";
import detectIndent from "detect-indent";
import detectNewLine from "detect-newline";
import { stringifyPackage } from "./libs/stringify-package.js";
import type { ForkConfigOptions } from "./configuration.js";

function getCurrentVersion(options: ForkConfigOptions): {
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
					if (existsSync(filePath)) {
						files.push(filePath);

						if (options.currentVersion) {
							continue;
						}

						const fileContents = JSON.parse(readFileSync(filePath, "utf8"));

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
	preMajor?: boolean;
	reason?: string;
	releaseType?: ReleaseType;
}> {
	if (semver.valid(options.nextVersion)) {
		return {
			version: options.nextVersion as string,
		};
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
		return Object.assign(recommendedBump, {
			preMajor,
			version: semver.inc(currentVersion, recommendedBump.releaseType) || "",
		});
	}

	throw new Error("Unable to find next version");
}

function updateFile(options: ForkConfigOptions, fileToUpdate: string, nextVersion: string) {
	try {
		switch (extname(fileToUpdate)) {
			case ".json": {
				const fileContents = readFileSync(fileToUpdate, "utf8");

				const indent = detectIndent(fileContents).indent;
				const newline = detectNewLine(fileContents);
				const parsedJson = JSON.parse(fileContents);

				parsedJson.version = nextVersion;
				if (parsedJson.packages && parsedJson.packages[""]) {
					parsedJson.packages[""].version = nextVersion; // package-lock v2 stores version there too
				}

				if (!options.dry) {
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
	const current = getCurrentVersion(options);
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
