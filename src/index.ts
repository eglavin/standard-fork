#!/usr/bin/env node

import { getForkConfig } from "./configuration.js";
import { FileSystem } from "./file-system.js";
import { bumpVersion } from "./version.js";

async function runFork() {
	const options = await getForkConfig();
	const fs = new FileSystem(!options.dry);

	const bumpResult = await bumpVersion(options, fs);

	console.log({
		options,
		bumpResult,
	});
}

runFork();
