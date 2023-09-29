import { createExecute } from "./utils/execute-file.js";
import { formatCommitMessage } from "./utils/format-commit-message.js";
import type { ForkConfigOptions } from "./configuration.js";
import type { bumpVersion } from "./version.js";

export async function commitChanges(
	options: ForkConfigOptions,
	bumpResult: Awaited<ReturnType<typeof bumpVersion>>,
) {
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

	const { executeGit } = createExecute(options);

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
			options.changelogPresetConfig?.releaseCommitMessageFormat || "chore(release): {{currentTag}}",
			bumpResult.next,
		),
	);

	return {
		filesToCommit,
		gitAddOutput,
		gitCommitOutput,
	};
}
