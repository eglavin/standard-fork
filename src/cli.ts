#!/usr/bin/env node

import { getUserConfig } from "./config/user-config";
import { Logger } from "./utils/logger";
import { FileManager } from "./strategies/file-manager";

import { getCurrentVersion, getNextVersion } from "./process/version";
import { updateChangelog } from "./process/changelog";
import { commitChanges } from "./process/commit";
import { tagChanges } from "./process/tag";
import { completedMessage } from "./process/message";

async function runFork() {
	const config = await getUserConfig();
	const logger = new Logger(config);
	const fileManager = new FileManager(config, logger);

	logger.log(`Running fork-version: ${new Date().toLocaleString()}`);
	logger.log(config.dryRun ? "[DRY RUN] No changes will be written to disk.\n" : "\n");

	const current = await getCurrentVersion(config, logger, fileManager);
	const next = await getNextVersion(config, logger, current.version);

	logger.log("Updating Files: ");
	for (const outFile of current.files) {
		logger.log(`\t${outFile.path}`);

		fileManager.write(outFile.path, next.version);
	}

	const changelogResult = await updateChangelog(config, logger, next.version);
	const commitResult = await commitChanges(config, logger, current.files, next.version);
	const tagResult = await tagChanges(config, logger, next.version);

	completedMessage(config, logger, current.files, next.releaseType);

	const result = {
		config,
		current,
		next,
		changelogResult,
		commitResult,
		tagResult,
	};

	logger.debug(JSON.stringify(result, null, 2));

	return result;
}

runFork();
