import { createExecute } from "../utils/execute-file";
import { formatCommitMessage } from "../utils/format-commit-message";
import type { ForkConfig } from "../config/schema";
import type { FileState } from "../strategies/file-manager";
import type { Logger } from "../utils/logger";

interface CommitChanges {
	filesToCommit: string[];
	gitAddOutput?: string;
	gitCommitOutput?: string;
}

export async function commitChanges(
	config: ForkConfig,
	logger: Logger,
	files: FileState[],
	nextVersion: string,
): Promise<CommitChanges> {
	const { git } = createExecute(config, logger);

	logger.log("Committing changes");

	const filesToCommit: string[] = [config.changelog];
	for (const file of files) {
		filesToCommit.push(file.name);
	}

	// If there are no files to commit don't continue.
	if (filesToCommit.length === 0) {
		return {
			filesToCommit,
		};
	}

	const gitAddOutput = await git("add", ...filesToCommit);

	const shouldVerify = config.verify ? undefined : "--no-verify";
	const shouldSign = config.sign ? "-S" : undefined;
	const shouldCommitAll = config.commitAll ? [] : filesToCommit;

	const gitCommitOutput = await git(
		"commit",
		shouldVerify,
		shouldSign,
		...shouldCommitAll,
		"-m",
		formatCommitMessage(config.changelogPresetConfig?.releaseCommitMessageFormat, nextVersion),
	);

	return {
		filesToCommit,
		gitAddOutput,
		gitCommitOutput,
	};
}
