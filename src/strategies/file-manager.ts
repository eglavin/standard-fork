import { JSONPackage } from "./json-package";
import { PlainText } from "./plain-text";
import { CSharpProject } from "./csharp-project";

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
	write(fileState: FileState, newVersion: string): void;
}

export class FileManager implements IFileManager {
	private JSONPackage: JSONPackage;
	private PlainText: PlainText;
	private CSharpProject: CSharpProject;

	constructor(
		private config: ForkConfig,
		private logger: Logger,
	) {
		this.JSONPackage = new JSONPackage(config, logger);
		this.PlainText = new PlainText(config, logger);
		this.CSharpProject = new CSharpProject(config, logger);
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
		const _fileName = fileName.toLowerCase();

		if (_fileName.endsWith(".json")) {
			return this.JSONPackage.read(fileName);
		}

		if (_fileName.endsWith("version.txt")) {
			return this.PlainText.read(fileName);
		}

		if (_fileName.endsWith(".csproj")) {
			return this.CSharpProject.read(fileName);
		}

		this.logger.error(`[File Manager] Unsupported file: ${fileName}`);
	}

	/**
	 * Write the new version to the given file.
	 *
	 * @example
	 * ```ts
	 * fileManager.write(
	 *   { name: "package.json", path: "/path/to/package.json", version: "1.2.2" },
	 *   "1.2.3"
	 * );
	 * ```
	 */
	public write(fileState: FileState, newVersion: string): void {
		if (this.config.dryRun) {
			return;
		}
		const _fileName = fileState.name.toLowerCase();

		if (_fileName.endsWith(".json")) {
			return this.JSONPackage.write(fileState, newVersion);
		}

		if (_fileName.endsWith("version.txt")) {
			return this.PlainText.write(fileState, newVersion);
		}

		if (_fileName.endsWith(".csproj")) {
			return this.CSharpProject.write(fileState, newVersion);
		}

		this.logger.error(`[File Manager] Unsupported file: ${fileState.path}`);
	}
}
