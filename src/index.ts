#!/usr/bin/env node

import { getForkConfig } from "./configuration.js";
import { bumpVersion } from "./version.js";

async function runFork() {
	const options = await getForkConfig();

	const bumpResult = await bumpVersion(options);

	console.log({
		options,
		bumpResult,
	});
}

runFork();
