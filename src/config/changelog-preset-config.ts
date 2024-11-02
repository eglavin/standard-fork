import { z } from "zod";
import conventionalChangelogConfigSpec from "conventional-changelog-config-spec";

import { ChangelogPresetConfigTypeSchema, ChangelogPresetConfigSchema } from "./schema.js";
import type { ForkConfig } from "./types.js";
import type { getCliArguments } from "./cli-arguments.js";
import type { DetectedGitHost } from "./detect-git-host.js";

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
				// If the user has requested to see all types, we need to remove the hidden flag from the default types.
				if (mergedConfig?.changelogAll && key === "types") {
					const parsedTypes = z.array(ChangelogPresetConfigTypeSchema).safeParse(value.default);

					if (parsedTypes.success) {
						parsedTypes.data.forEach((type) => {
							if (!type.section) {
								delete type.hidden;
								type.section = "Other Changes";
							}
						});
						preset[key] = parsedTypes.data;

						return;
					}
				}

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
