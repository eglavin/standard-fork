import gitSemverTags from "git-semver-tags";
import semver from "semver";

/**
 * Get the latest git tag version.
 *
 * @example
 * ```ts
 * const tagPrefix = "v";
 * await getLatestGitTagVersion(tagPrefix); // 1.2.3
 * ```
 */
export async function getLatestGitTagVersion(tagPrefix: string | undefined): Promise<string> {
	const gitTags = await gitSemverTags({ tagPrefix });
	if (!gitTags.length) {
		return "";
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
