import { JSONPackage } from "./json-package.js";
import { YAMLPackage } from "./yaml-package.js";
import { PlainText } from "./plain-text.js";
import { MSBuildProject } from "./ms-build-project.js";

import type { ForkConfig } from "../config/types.js";
import type { Logger } from "../utils/logger.js";

export interface FileState {
	name: string;
	path: string;
	version: string;

	[other: string]: unknown;
}

export interface IFileManager {
	read(fileName: string): FileState | undefined;
	write(fileState: FileState, newVersion: string): void;
	isSupportedFile(fileName: string): boolean;
}

export class FileManager {
	private JSONPackage: JSONPackage;
	private YAMLPackage: YAMLPackage;
	private PlainText: PlainText;
	private MSBuildProject: MSBuildProject;

	constructor(
		private config: ForkConfig,
		private logger: Logger,
	) {
		this.JSONPackage = new JSONPackage(config, logger);
		this.YAMLPackage = new YAMLPackage(config, logger);
		this.PlainText = new PlainText(config, logger);
		this.MSBuildProject = new MSBuildProject(config, logger);
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

		if (this.JSONPackage.isSupportedFile(_fileName)) {
			return this.JSONPackage.read(fileName);
		}

		if (this.YAMLPackage.isSupportedFile(_fileName)) {
			return this.YAMLPackage.read(fileName);
		}

		if (this.PlainText.isSupportedFile(_fileName)) {
			return this.PlainText.read(fileName);
		}

		if (this.MSBuildProject.isSupportedFile(_fileName)) {
			return this.MSBuildProject.read(fileName);
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

		if (this.JSONPackage.isSupportedFile(_fileName)) {
			return this.JSONPackage.write(fileState, newVersion);
		}

		if (this.YAMLPackage.isSupportedFile(_fileName)) {
			return this.YAMLPackage.write(fileState, newVersion);
		}

		if (this.PlainText.isSupportedFile(_fileName)) {
			return this.PlainText.write(fileState, newVersion);
		}

		if (this.MSBuildProject.isSupportedFile(_fileName)) {
			return this.MSBuildProject.write(fileState, newVersion);
		}

		this.logger.error(`[File Manager] Unsupported file: ${fileState.path}`);
	}
}
