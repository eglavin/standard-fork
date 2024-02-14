#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";

const readmeContent = readFileSync("README.md", "utf8");
if (!readmeContent) {
	throw new Error("Could not read README.md");
}

const coverageContent = readFileSync("code-coverage-results.md", "utf8");
if (!coverageContent) {
	throw new Error("Could not read code-coverage-results.md");
}

const TABLE_START_PREFIX = "<!-- Code Coverage Table Start -->";
const TABLE_END_PREFIX = "<!-- Code Coverage Table End -->";

const newContent = readmeContent.replace(
	new RegExp(`${TABLE_START_PREFIX}[\\s\\S]*${TABLE_END_PREFIX}`),
	`${TABLE_START_PREFIX}

${coverageContent}

${TABLE_END_PREFIX}`,
);

console.log(newContent);

writeFileSync("README.md", newContent, "utf8");
