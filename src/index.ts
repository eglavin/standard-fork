#!/usr/bin/env node

import { getForkConfig } from "./configuration.js";
import { bumpVersion } from "./version.js";
import { updateChangelog } from "./changelog.js";
import { commitChanges } from "./commit.js";
import { tagChanges } from "./tag.js";

async function runFork() {
	const options = await getForkConfig();

	options.log(`Running Fork: ${new Date().toLocaleString()}\n`);

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
