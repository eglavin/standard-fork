import { createExecute } from "../utils/execute-file.js";
import { formatCommitMessage } from "../utils/format-commit-message.js";
import type { ForkConfig } from "../configuration/schema.js";
import type { BumpVersion } from "./version.js";

interface TagChanges {
	gitTagOutput: string;
	currentBranchName: string;
	hasPublicPackageFile: boolean;
	pushMessage: string;
	publishMessage: string;
}

export async function tagChanges(config: ForkConfig, bumpResult: BumpVersion): Promise<TagChanges> {
	const { git } = createExecute(config);

	const shouldSign = config.sign ? "-s" : "-a";
	/** @example "v1.2.3" or "version/1.2.3" */
	const tag = `${config.tagPrefix}${bumpResult.nextVersion}`;

	config.log(`Creating Tag: ${tag}`);

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

	config.log(`\n${pushMessage}\n${hasPublicPackageFile ? publishMessage : ""}`);

	return {
		gitTagOutput,
		currentBranchName,
		hasPublicPackageFile,
		pushMessage,
		publishMessage,
	};
}
