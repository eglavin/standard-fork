import { resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

import { fileExists } from "../utils/file-state.js";
import type { ForkConfig } from "../config/types.js";
import type { Logger } from "../utils/logger.js";
import type { FileState, IFileManager } from "./file-manager.js";

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

		this.logger.warn(`[File Manager] Unable to determine plain text: ${fileName}`);
	}

	public write(fileState: FileState, newVersion: string) {
		writeFileSync(fileState.path, newVersion, "utf8");
	}

	public isSupportedFile(fileName: string): boolean {
		return fileName.endsWith("version.txt");
	}
}
