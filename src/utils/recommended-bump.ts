import type { Commit } from "../commit-parser/types";

type ReleaseType = "major" | "minor" | "patch";

interface IRecommendedBump {
	releaseType: ReleaseType;
	changes: {
		major: number;
		minor: number;
		patch: number;
		notes: number;
	};
}

export function recommendedBump(commits: Commit[], isPreMajor = false): IRecommendedBump {
	let major = 0;
	let minor = 0;
	let patch = 0;
	let notes = 0;

	for (const commit of commits) {
		if (commit.breakingChange || commit.notes.length > 0) {
			major++;
			notes += commit.notes.length;
		} else if (["feature", "feat"].includes(commit.type)) {
			minor++;
		} else {
			patch++;
		}
	}

	let releaseType: ReleaseType = "patch";

	// If we're pre-major, we should only release a minor at most, its upto the
	// user to manually bump to 1.0.0.
	if (isPreMajor) {
		if (major > 0) {
			releaseType = "minor";
		}
	} else {
		if (major > 0) {
			releaseType = "major";
		} else if (minor > 0) {
			releaseType = "minor";
		}
	}

	return {
		releaseType,
		changes: {
			major,
			minor,
			patch,
			notes,
		},
	};
}
