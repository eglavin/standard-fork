#!/usr/bin/env node
// @ts-check

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { helperText } from "../src/config/cli-arguments.js";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const readmeLocation = join(projectRoot, "README.md");

const readmeContent = readFileSync(readmeLocation, "utf-8");

const startMarker = "<!-- START COMMAND LINE OPTIONS -->";
const endMarker = "<!-- END COMMAND LINE OPTIONS -->";

writeFileSync(
	readmeLocation,
	readmeContent.replace(
		new RegExp(`${startMarker}[\\s\\S]*${endMarker}`),
		`${startMarker}

\`\`\`txt
${helperText}
\`\`\`

${endMarker}`,
	),
);
