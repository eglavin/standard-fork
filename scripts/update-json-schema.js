#!/usr/bin/env node
// @ts-check

import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ForkConfigSchema } from "../src/config/schema.js";
import { clickableLink } from "./utils/clickable-link.js";

const schemaLocation = join(import.meta.dirname, "..", "schema", `latest.json`);
const jsonSchema = zodToJsonSchema(ForkConfigSchema);

writeFileSync(
	schemaLocation,
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

console.log(
	`Updated JSON schema: ${clickableLink(pathToFileURL(schemaLocation).href, schemaLocation)}`,
);
