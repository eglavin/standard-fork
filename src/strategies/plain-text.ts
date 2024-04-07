import { resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

import { fileExists } from "../utils/file-state";
import type { ForkConfig } from "../config/schema";
import type { Logger } from "../utils/logger";
import type { FileState, IFileManager } from "./file-manager";

/**
 * A plain text file will have just the version as the content.
 *
 * @example
 * ```txt
 * 1.2.3
 * ```
 */
export class PlainText implements IFileManager {
	constructor(
		private config: ForkConfig,
		private logger: Logger,
	) {}

	public read(fileName: string): FileState | undefined {
		const filePath = resolve(this.config.path, fileName);

		if (fileExists(filePath)) {
			const fileContents = readFileSync(filePath, "utf8");

			return {
				name: fileName,
				path: filePath,
				version: fileContents || "",
			};
		}
	}

	public write(filePath: string, newVersion: string) {
		writeFileSync(filePath, newVersion, "utf8");
	}
}
