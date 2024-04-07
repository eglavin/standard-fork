import { resolve } from "node:path";
import { Git } from "../utils/git";
import { formatCommitMessage } from "../utils/format-commit-message";
import { fileExists } from "../utils/file-state";
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
	const git = new Git(config, logger);

	logger.log("Committing changes");

	const filesToCommit: string[] = [];
	if (fileExists(resolve(config.path, config.changelog))) {
		filesToCommit.push(resolve(config.path, config.changelog));
	}
	for (const file of files) {
		filesToCommit.push(file.path);
	}

	// If there are no files to commit don't continue.
	if (filesToCommit.length === 0) {
		return {
			filesToCommit,
		};
	}

	const shouldVerify = config.verify ? undefined : "--no-verify";
	const shouldSign = config.sign ? "--gpg-sign" : undefined;

	// If commitAll is set, commit all changed files.
	if (config.commitAll) {
		return {
			filesToCommit,
			gitAddOutput: await git.add("--all"),
			gitCommitOutput: await git.commit(
				shouldVerify,
				shouldSign,
				"--message",
				formatCommitMessage(config.changelogPresetConfig?.releaseCommitMessageFormat, nextVersion),
			),
		};
	}

	return {
		filesToCommit,
		gitAddOutput: await git.add(...filesToCommit),
		gitCommitOutput: await git.commit(
			shouldVerify,
			shouldSign,
			...filesToCommit,
			"--message",
			formatCommitMessage(config.changelogPresetConfig?.releaseCommitMessageFormat, nextVersion),
		),
	};
}
