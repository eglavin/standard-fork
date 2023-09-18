#!/usr/bin/env node

import { ConfigurationClass } from "./configuration.js";

async function runFork() {
	const config = new ConfigurationClass();
	await config.readConfig();

	console.log(config.getConfig());
}

runFork();
