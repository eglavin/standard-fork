import { createExecute } from "./utils/execute-file.js";
import { formatCommitMessage } from "./utils/format-commit-message.js";
import type { ForkConfigOptions } from "./configuration.js";
import type { bumpVersion } from "./version.js";

export async function tagChanges(
	options: ForkConfigOptions,
	bumpResult: Awaited<ReturnType<typeof bumpVersion>>,
) {
	const { executeGit } = createExecute(options);

	const shouldSign = options.sign ? "-s" : "-a";
	const tag = `${options.tagPrefix}${bumpResult.next}`;

	const gitTagOutput = await executeGit(
		"tag",
		shouldSign,
		tag,
		"-m",
		formatCommitMessage(
			options.changelogPresetConfig?.releaseCommitMessageFormat || "chore(release): {{currentTag}}",
			bumpResult.next,
		),
	);

	// Get the current branch name
	const gitRevParse = await executeGit("rev-parse", "--abbrev-ref", "HEAD");

	return {
		gitTagOutput,
		gitRevParse,
	};
}
