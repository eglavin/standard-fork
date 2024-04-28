import { resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import * as cheerio from "cheerio/lib/slim";

import { fileExists } from "../utils/file-state";
import type { ForkConfig } from "../config/schema";
import type { Logger } from "../utils/logger";
import type { FileState, IFileManager } from "./file-manager";

/**
 * A csproj file is an xml file with a version property under the Project > PropertyGroup node.
 *
 * @example
 * ```xml
 * <Project Sdk="Microsoft.NET.Sdk">
 *   <PropertyGroup>
 *     <Version>1.2.3</Version>
 *   </PropertyGroup>
 * </Project>
 * ```
 */
export class CSharpProject implements IFileManager {
	constructor(
		private config: ForkConfig,
		private logger: Logger,
	) {}

	public read(fileName: string): FileState | undefined {
		const filePath = resolve(this.config.path, fileName);

		if (fileExists(filePath)) {
			const fileContents = readFileSync(filePath, "utf8");
			const $ = cheerio.load(fileContents, { xmlMode: true });

			const version = $("Project > PropertyGroup > Version").text();
			if (version) {
				return {
					name: fileName,
					path: filePath,
					version: version,
				};
			}

			this.logger.warn(`[File Manager] Unable to determine csproj package: ${fileName}`);
		}
	}

	public write(fileState: FileState, newVersion: string) {
		const fileContents = readFileSync(fileState.path, "utf8");
		const $ = cheerio.load(fileContents, { xmlMode: true });

		$("Project > PropertyGroup > Version").text(newVersion);

		// Cheerio doesn't handle self-closing tags well,
		// so we're manually adding a space before the closing tag.
		const updatedContent = $.xml().replaceAll('"/>', '" />');

		writeFileSync(fileState.path, updatedContent, "utf8");
	}
}
