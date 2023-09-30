import { createExecute } from "./utils/execute-file.js";
import { formatCommitMessage } from "./utils/format-commit-message.js";
import type { ForkConfigOptions } from "./configuration.js";
import type { BumpVersion } from "./version.js";

type CommitChanges = {
	filesToCommit: string[];
	gitAddOutput?: string;
	gitCommitOutput?: string;
};

export async function commitChanges(
	options: ForkConfigOptions,
	bumpResult: BumpVersion,
): Promise<CommitChanges> {
	const { executeGit } = createExecute(options);

	options.log("Committing changes");

	const filesToCommit: string[] = [options.changelog];
	for (const file of bumpResult.files) {
		filesToCommit.push(file.name);
	}

	// If there are no files to commit don't continue.
	if (filesToCommit.length === 0) {
		return {
			filesToCommit,
		};
	}

	const gitAddOutput = await executeGit("add", ...filesToCommit);

	const shouldVerify = options.verify ? undefined : "--no-verify";
	const shouldSign = options.sign ? "-S" : undefined;
	const shouldCommitAll = options.commitAll ? [] : filesToCommit;

	const gitCommitOutput = await executeGit(
		"commit",
		shouldVerify,
		shouldSign,
		...shouldCommitAll,
		"-m",
		formatCommitMessage(
			options.changelogPresetConfig?.releaseCommitMessageFormat,
			bumpResult.nextVersion,
		),
	);

	return {
		filesToCommit,
		gitAddOutput,
		gitCommitOutput,
	};
}
