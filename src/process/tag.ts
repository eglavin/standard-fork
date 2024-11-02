import { formatCommitMessage } from "../utils/format-commit-message.js";
import type { ForkConfig } from "../config/types.js";
import type { Logger } from "../utils/logger.js";
import type { Git } from "../utils/git.js";

export async function tagChanges(
	config: ForkConfig,
	logger: Logger,
	git: Git,
	nextVersion: string,
): Promise<void> {
	if (config.skipTag) {
		logger.log("Skip tag creation");
		return;
	}

	/** @example "v1.2.3" or "version/1.2.3" */
	const tag = `${config.tagPrefix}${nextVersion}`;

	logger.log(`Creating Tag: ${tag}`);

	await git.tag(
		config.sign ? "--sign" : "--annotate",
		tag,
		"--message",
		formatCommitMessage(config.changelogPresetConfig?.releaseCommitMessageFormat, nextVersion),
	);
}
