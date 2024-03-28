import { createExecute } from "../utils/execute-file.js";
import { formatCommitMessage } from "../utils/format-commit-message.js";
import type { ForkConfig } from "../configuration.js";
import type { BumpVersion } from "./version.js";

interface CommitChanges {
	filesToCommit: string[];
	gitAddOutput?: string;
	gitCommitOutput?: string;
}

export async function commitChanges(
	config: ForkConfig,
	bumpResult: BumpVersion,
): Promise<CommitChanges> {
	const { git } = createExecute(config);

	config.log("Committing changes");

	const filesToCommit: string[] = [config.changelog];
	for (const file of bumpResult.files) {
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
		formatCommitMessage(
			config.changelogPresetConfig?.releaseCommitMessageFormat,
			bumpResult.nextVersion,
		),
	);

	return {
		filesToCommit,
		gitAddOutput,
		gitCommitOutput,
	};
}
