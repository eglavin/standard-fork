#!/usr/bin/env node

import { ForkConfig } from "./configuration.js";
import { FileSystem } from "./file-system.js";

async function runFork() {
	const conf = new ForkConfig();
	const options = await conf.readConfig();

	const fs = new FileSystem(!options.dry);

	console.log(options);
}

runFork();
