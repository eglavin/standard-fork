#!/usr/bin/env node
// @ts-check

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ForkConfigSchema } from "../dist/index.js";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { name, version } = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf-8"));
const outputLocation = join(projectRoot, "schema", `latest.json`);

console.log(`Generating JSON schema for ${name} ${version}`);
const jsonSchema = zodToJsonSchema(ForkConfigSchema);

writeFileSync(
	outputLocation,
	JSON.stringify(
		{
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			additionalProperties: false,
			properties: jsonSchema["properties"],
		},
		null,
		2,
	),
);
