#!/usr/bin/env node

import { getUserConfig } from "./configuration/user-config";
import { bumpVersion } from "./process/version";
import { updateChangelog } from "./process/changelog";
import { commitChanges } from "./process/commit";
import { tagChanges } from "./process/tag";
import { Logger } from "./utils/logger";

async function runFork() {
	const config = await getUserConfig();
	const logger = new Logger(config);

	logger.log(`Running Fork: ${new Date().toLocaleString()}
${config.dryRun ? "Dry run, no changes will be written to disk.\n" : ""}`);

	const bumpResult = await bumpVersion(config, logger);
	const changelogResult = await updateChangelog(config, logger, bumpResult);
	const commitResult = await commitChanges(config, logger, bumpResult);
	const tagResult = await tagChanges(config, logger, bumpResult);

	const result = {
		config,
		bumpResult,
		changelogResult,
		commitResult,
		tagResult,
	};

	logger.debug(JSON.stringify(result, null, 2));

	return result;
}

runFork();
