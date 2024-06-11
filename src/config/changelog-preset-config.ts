import conventionalChangelogConfigSpec from "conventional-changelog-config-spec";

import { ChangelogPresetConfigSchema, type ForkConfig } from "./schema";
import type { getCliArguments } from "./cli-arguments";
import type { DetectedGitHost } from "./detect-git-host";

export function getChangelogPresetConfig(
	mergedConfig: Partial<ForkConfig> | undefined,
	cliArgumentsFlags: ReturnType<typeof getCliArguments>["flags"],
	detectedGitHost: DetectedGitHost | null,
) {
	const preset: { name: string; [_: string]: unknown } = {
		name: "conventionalcommits",
	};

	// First take any default values from the conventional-changelog-config-spec
	if (typeof conventionalChangelogConfigSpec.properties === "object") {
		Object.entries(conventionalChangelogConfigSpec.properties).forEach(([key, value]) => {
			if ("default" in value && value.default !== undefined) {
				preset[key] = value.default;
			}
		});
	}

	// If we've detected a git host, use the values from the detected host now so that they can
	// be overwritten by the users config later
	if (detectedGitHost) {
		Object.entries(detectedGitHost).forEach(([key, value]) => {
			if (value !== undefined) {
				preset[key] = value;
			}
		});
	}

	// Then overwrite with any values from the users config
	if (
		mergedConfig?.changelogPresetConfig &&
		typeof mergedConfig.changelogPresetConfig === "object"
	) {
		Object.entries(mergedConfig.changelogPresetConfig).forEach(([key, value]) => {
			if (value !== undefined) {
				preset[key] = value;
			}
		});
	}

	// If the user has defined a releaseMessageSuffix, append it to the releaseCommitMessageFormat
	if (mergedConfig?.releaseMessageSuffix && !cliArgumentsFlags?.releaseMessageSuffix) {
		preset.releaseCommitMessageFormat = `${preset.releaseCommitMessageFormat} ${mergedConfig.releaseMessageSuffix}`;
	}

	// Finally overwrite with any values from the CLI arguments
	if (cliArgumentsFlags?.commitUrlFormat) {
		preset.commitUrlFormat = cliArgumentsFlags.commitUrlFormat;
	}
	if (cliArgumentsFlags?.compareUrlFormat) {
		preset.compareUrlFormat = cliArgumentsFlags.compareUrlFormat;
	}
	if (cliArgumentsFlags?.issueUrlFormat) {
		preset.issueUrlFormat = cliArgumentsFlags.issueUrlFormat;
	}
	if (cliArgumentsFlags?.userUrlFormat) {
		preset.userUrlFormat = cliArgumentsFlags.userUrlFormat;
	}
	if (cliArgumentsFlags?.releaseCommitMessageFormat) {
		preset.releaseCommitMessageFormat = cliArgumentsFlags.releaseCommitMessageFormat;
	}
	if (cliArgumentsFlags?.releaseMessageSuffix) {
		preset.releaseCommitMessageFormat = `${preset.releaseCommitMessageFormat} ${cliArgumentsFlags.releaseMessageSuffix}`;
	}

	return ChangelogPresetConfigSchema.passthrough().parse(preset);
}
