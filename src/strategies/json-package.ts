import { resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import detectIndent from "detect-indent";
import { detectNewline } from "detect-newline";

import { stringifyPackage } from "../libs/stringify-package";
import { fileExists } from "../utils/file-state";
import type { ForkConfig } from "../config/schema";
import type { Logger } from "../utils/logger";
import type { FileState, IFileManager } from "./file-manager";

/**
 * A json package file should have a version property, like what can be seen
 * in the package.json file in the root of this project.
 *
 * @example
 * ```json
 * {
 *   "name": "fork-version",
 *   "version": "1.2.3",
 *   "private": true,
 * }
 * ```
 */
export class JSONPackage implements IFileManager {
	constructor(
		private config: ForkConfig,
		private logger: Logger,
	) {}

	public read(fileName: string): FileState | undefined {
		const filePath = resolve(this.config.path, fileName);

		if (fileExists(filePath)) {
			const fileContents = readFileSync(filePath, "utf8");
			const parsedJson = JSON.parse(fileContents);

			if (parsedJson.version) {
				return {
					name: fileName,
					path: filePath,
					version: parsedJson.version,

					isPrivate: typeof parsedJson?.private === "boolean" ? parsedJson.private : true,
				};
			}

			this.logger.warn(`[File Manager] Unable to determine json package: ${fileName}`);
		}
	}

	public write(fileState: FileState, newVersion: string) {
		const fileContents = readFileSync(fileState.path, "utf8");
		const parsedJson = JSON.parse(fileContents);

		parsedJson.version = newVersion;
		if (parsedJson.packages?.[""]) {
			parsedJson.packages[""].version = newVersion; // package-lock v2 stores version here too.
		}

		writeFileSync(
			fileState.path,
			stringifyPackage(parsedJson, detectIndent(fileContents).amount, detectNewline(fileContents)),
			"utf8",
		);
	}
}
