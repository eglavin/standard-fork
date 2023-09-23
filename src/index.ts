#!/usr/bin/env node

import { ForkConfig } from "./configuration.js";
import { FileSystem } from "./file-system.js";
import { bumpVersion } from "./version.js";

async function runFork() {
	const forkConfig = new ForkConfig();
	const options = await forkConfig.readConfig();

	const fs = new FileSystem(!options.dry);

	const { current, next, files, releaseType, level, reason } = await bumpVersion(options, fs);

	console.log({
		options,
		current,
		next,
		files,
		releaseType,
		level,
		reason,
	});
}

runFork();
