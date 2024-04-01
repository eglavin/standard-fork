import { JSONPackage } from "./json-package";
import { PlainText } from "./plain-text";

import type { ForkConfig } from "../config/schema";
import type { Logger } from "../utils/logger";

export interface FileState {
	name: string;
	path: string;
	version: string;

	[other: string]: unknown;
}

export interface IFileManager {
	read(fileName: string): FileState | undefined;
	write(filePath: string, newVersion: string): void;
}

export class FileManager implements IFileManager {
	private JSONPackage: JSONPackage;
	private PlainText: PlainText;

	constructor(
		private config: ForkConfig,
		private logger: Logger,
	) {
		this.JSONPackage = new JSONPackage(config, logger);
		this.PlainText = new PlainText(config, logger);
	}

	/**
	 * Get the state from the given file name.
	 *
	 * @example
	 * ```ts
	 * fileManager.read("package.json");
	 * ```
	 *
	 * @returns
	 * ```json
	 * { "name": "package.json", "path": "/path/to/package.json", "version": "1.2.3", "isPrivate": true }
	 * ```
	 */
	public read(fileName: string): FileState | undefined {
		if (fileName.toLowerCase().endsWith(".json")) {
			return this.JSONPackage.read(fileName);
		} else if (fileName.toLowerCase().endsWith("version.txt")) {
			return this.PlainText.read(fileName);
		}

		this.logger.error(`Unsupported file type: ${fileName}`);
	}

	/**
	 * Write the new version to the given file path.
	 *
	 * @example
	 * ```ts
	 * fileManager.write("/path/to/package.json", "1.2.3");
	 * ```
	 */
	public write(filePath: string, newVersion: string): void {
		if (this.config.dryRun) {
			this.logger.log(`[Dry run]: Not updating ${filePath}`);
			return;
		}

		if (filePath.toLowerCase().endsWith(".json")) {
			return this.JSONPackage.write(filePath, newVersion);
		} else if (filePath.toLowerCase().endsWith("version.txt")) {
			return this.PlainText.write(filePath, newVersion);
		}

		this.logger.error(`Unsupported file type: ${filePath}`);
	}
}
