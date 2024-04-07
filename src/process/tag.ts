import { Git } from "../utils/git";
import { formatCommitMessage } from "../utils/format-commit-message";
import type { ForkConfig } from "../config/schema";
import type { Logger } from "../utils/logger";

interface TagChanges {
	gitTagOutput: string;
}

export async function tagChanges(
	config: ForkConfig,
	logger: Logger,
	nextVersion: string,
): Promise<TagChanges> {
	const git = new Git(config, logger);

	const shouldSign = config.sign ? "-s" : "-a";
	/** @example "v1.2.3" or "version/1.2.3" */
	const tag = `${config.tagPrefix}${nextVersion}`;

	logger.log(`Creating Tag: ${tag}`);

	const gitTagOutput = await git.tag(
		shouldSign,
		tag,
		"-m",
		formatCommitMessage(config.changelogPresetConfig?.releaseCommitMessageFormat, nextVersion),
	);

	return {
		gitTagOutput,
	};
}
