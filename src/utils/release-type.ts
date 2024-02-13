import semver, { ReleaseType } from "semver";

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
 * ```js
 * getReleaseType("patch", "1.0.0", false) => "patch"
 * getReleaseType("major", "0.0.0-beta", "beta") => "premajor"
 * ```
 */
export function getReleaseType(
	releaseType: "major" | "minor" | "patch",
	currentVersion: string,
	preReleaseTag?: string | boolean,
): ReleaseType {
	if (!preReleaseTag) {
		return releaseType;
	}

	const currentVersionsIsPreRelease = Array.isArray(semver.prerelease(currentVersion));
	if (currentVersionsIsPreRelease) {
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
