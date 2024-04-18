import { Git } from "../utils/git";
import type { ForkConfig } from "../config/schema";
import type { FileState } from "../strategies/file-manager";
import type { Logger } from "../utils/logger";

export async function completedMessage(
	config: ForkConfig,
	logger: Logger,
	files: FileState[],
	releaseType: string | undefined,
) {
	const git = new Git(config, logger);

	// Print git push command
	const branchName = await git.currentBranch();

	logger.log(
		`\nRun \`git push --follow-tags origin ${branchName}\` to push the changes and the tag.`,
	);

	// Print npm publish command
	if (files.some((file) => file.name === "package.json" && file.isPrivate === false)) {
		const npmTag = typeof config.preReleaseTag === "string" ? config.preReleaseTag : "prerelease";

		logger.log(
			`${releaseType}`.startsWith("pre")
				? `Run \`npm publish --tag ${npmTag}\` to publish the package.`
				: "Run `npm publish` to publish the package.",
		);
	}
}
