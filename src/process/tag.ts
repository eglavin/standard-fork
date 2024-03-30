import { createExecute } from "../utils/execute-file";
import { formatCommitMessage } from "../utils/format-commit-message";
import type { ForkConfig } from "../configuration/schema";
import type { BumpVersion } from "./version";
import type { Logger } from "../utils/logger";

interface TagChanges {
	gitTagOutput: string;
	currentBranchName: string;
	hasPublicPackageFile: boolean;
	pushMessage: string;
	publishMessage: string;
}

export async function tagChanges(
	config: ForkConfig,
	logger: Logger,
	bumpResult: BumpVersion,
): Promise<TagChanges> {
	const { git } = createExecute(config, logger);

	const shouldSign = config.sign ? "-s" : "-a";
	/** @example "v1.2.3" or "version/1.2.3" */
	const tag = `${config.tagPrefix}${bumpResult.nextVersion}`;

	logger.log(`Creating Tag: ${tag}`);

	const gitTagOutput = await git(
		"tag",
		shouldSign,
		tag,
		"-m",
		formatCommitMessage(
			config.changelogPresetConfig?.releaseCommitMessageFormat,
			bumpResult.nextVersion,
		),
	);

	const currentBranchName = await git("rev-parse", "--abbrev-ref", "HEAD");

	const hasPublicPackageFile = bumpResult.files.some(
		(file) => file.name === "package.json" && file.isPrivate === false,
	);
	const isPreRelease = `${bumpResult.releaseType}`.startsWith("pre");

	const pushMessage = `Run \`git push --follow-tags origin ${currentBranchName.trim()}\` to push the changes and the tag.`;
	const publishMessage = isPreRelease
		? `Run \`npm publish --tag ${
				typeof config.preReleaseTag === "string" ? config.preReleaseTag : "prerelease"
			}\` to publish the package.`
		: "Run `npm publish` to publish the package.";

	logger.log(`\n${pushMessage}\n${hasPublicPackageFile ? publishMessage : ""}`);

	return {
		gitTagOutput,
		currentBranchName,
		hasPublicPackageFile,
		pushMessage,
		publishMessage,
	};
}
