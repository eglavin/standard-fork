#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { getUserConfig } from "./config/user-config.js";
import { Logger } from "./utils/logger.js";
import { FileManager } from "./strategies/file-manager.js";
import { Git } from "./utils/git.js";

import { getCurrentVersion, getNextVersion } from "./process/version.js";
import { updateChangelog } from "./process/changelog.js";
import { commitChanges } from "./process/commit.js";
import { tagChanges } from "./process/tag.js";

async function runFork() {
	const startTime = Date.now();

	const config = await getUserConfig();

	const logger = new Logger(config);
	const fileManager = new FileManager(config, logger);
	const git = new Git(config, logger);

	logger.log(`Running fork-version - ${new Date().toUTCString()}`);
	logger.log(config.dryRun ? "[DRY RUN] No changes will be written to disk.\n" : ""); //

	/**
	 * Get the list of files to update, excluding any files that are ignored by git.
	 */
	const filesToUpdate: string[] = [];
	for (const file of config.files) {
		if (!(await git.shouldIgnore(file))) {
			filesToUpdate.push(file);
		}
	}

	const current = await getCurrentVersion(config, logger, fileManager, filesToUpdate);
	const next = await getNextVersion(config, logger, current.version);

	logger.log("Updating Files: ");
	for (const outFile of current.files) {
		logger.log(`  - ${outFile.path}`);

		fileManager.write(outFile, next.version);
	}

	await updateChangelog(config, logger, next.version);
	await commitChanges(config, logger, git, current.files, next.version);
	await tagChanges(config, logger, git, next.version);

	// Print git push command
	const branchName = await git.currentBranch();
	logger.log(
		`\nRun \`git push --follow-tags origin ${branchName}\` to push the changes and the tag.`,
	);

	// Print npm publish command
	if (current.files.some((file) => file.name === "package.json" && file.isPrivate === false)) {
		const npmTag = typeof config.preRelease === "string" ? config.preRelease : "prerelease";
		logger.log(
			`${next.releaseType}`.startsWith("pre")
				? `Run \`npm publish --tag ${npmTag}\` to publish the package.`
				: "Run `npm publish` to publish the package.",
		);
	}

	logger.debug(`Completed in ${Date.now() - startTime} ms`);

	const result = {
		config,
		current,
		next,
	};

	if (!config.dryRun && config.debug) {
		writeFileSync(
			join(config.path, `fork-version-${Date.now()}.debug-log.json`),
			JSON.stringify(result, null, 2),
		);
	}

	return result;
}

runFork();
