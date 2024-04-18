#!/usr/bin/env bun

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ForkConfigSchema } from "../src/config/schema.js";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const packageJson = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf-8"));
const outputLocation = join(projectRoot, "schema", `${packageJson.version}.json`);

console.log(`Generating JSON schema for ${packageJson.name} ${packageJson.version}`);

const jsonSchema = zodToJsonSchema(ForkConfigSchema, "type");

writeFileSync(outputLocation, JSON.stringify(jsonSchema, null, 2));
