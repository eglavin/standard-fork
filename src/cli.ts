#!/usr/bin/env node

import { getForkConfig } from "./configuration/user-config.js";
import { bumpVersion } from "./process/version.js";
import { updateChangelog } from "./process/changelog.js";
import { commitChanges } from "./process/commit.js";
import { tagChanges } from "./process/tag.js";

async function runFork() {
	const config = await getForkConfig();

	config.log(`Running Fork: ${new Date().toLocaleString()}
${config.dryRun ? "Dry run, no changes will be written to disk.\n" : ""}`);

	const bumpResult = await bumpVersion(config);
	const changelogResult = await updateChangelog(config, bumpResult);
	const commitResult = await commitChanges(config, bumpResult);
	const tagResult = await tagChanges(config, bumpResult);

	const result = {
		config,
		bumpResult,
		changelogResult,
		commitResult,
		tagResult,
	};

	config.debug(JSON.stringify(result, null, 2));

	return result;
}

runFork();
