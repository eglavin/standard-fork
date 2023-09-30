#!/usr/bin/env node

import { getForkConfig } from "./configuration.js";
import { bumpVersion } from "./process/version.js";
import { updateChangelog } from "./process/changelog.js";
import { commitChanges } from "./process/commit.js";
import { tagChanges } from "./process/tag.js";

async function runFork() {
	const options = await getForkConfig();

	options.log(`Running Fork: ${new Date().toLocaleString()}
${options.dryRun ? "Dry run, no changes will be written to disk.\n" : ""}`);

	const bumpResult = await bumpVersion(options);
	const changelogResult = await updateChangelog(options, bumpResult);
	const commitResult = await commitChanges(options, bumpResult);
	const tagResult = await tagChanges(options, bumpResult);

	const result = {
		options,
		bumpResult,
		changelogResult,
		commitResult,
		tagResult,
	};

	options.debug(JSON.stringify(result, null, 2));

	return result;
}

runFork();
