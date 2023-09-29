import { createExecute } from "./utils/execute-file.js";
import { formatCommitMessage } from "./utils/format-commit-message.js";
import type { ForkConfigOptions } from "./configuration.js";
import type { BumpVersion } from "./version.js";

type TagChanges = {
	gitTagOutput: string;
	currentBranchName: string;
	hasPackageJson: boolean;
	pushMessage: string;
	publishMessage: string;
};

export async function tagChanges(
	options: ForkConfigOptions,
	bumpResult: BumpVersion,
): Promise<TagChanges> {
	const { executeGit } = createExecute(options);

	const shouldSign = options.sign ? "-s" : "-a";
	/** @example "v1.2.3" or "version/1.2.3" */
	const tag = `${options.tagPrefix}${bumpResult.nextVersion}`;

	const gitTagOutput = await executeGit(
		"tag",
		shouldSign,
		tag,
		"-m",
		formatCommitMessage(
			options.changelogPresetConfig?.releaseCommitMessageFormat,
			bumpResult.nextVersion,
		),
	);

	const currentBranchName = await executeGit("rev-parse", "--abbrev-ref", "HEAD");

	const pushMessage = `Run \`git push --follow-tags origin ${currentBranchName.trim()}\` to push the tag.`;

	const hasPackageJson = bumpResult.files.some((file) => file.name === "package.json");
	const isPreRelease = `${bumpResult.releaseType}`.startsWith("pre");
	const publishMessage = isPreRelease
		? `Run \`npm publish --tag ${
				typeof options.preReleaseTag === "string" ? options.preReleaseTag : "prerelease"
		  }\` to publish the package.`
		: `Run \`npm publish\` to publish the package.`;

	return {
		gitTagOutput,
		currentBranchName,
		hasPackageJson,
		pushMessage,
		publishMessage,
	};
}
