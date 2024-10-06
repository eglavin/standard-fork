import { lstatSync } from "fs";

/**
 * Determine if a file exists.
 * @example
 * ```ts
 * fileExists("~/.bashrc"); // true
 * fileExists("~/missing-file.txt"); // false
 * ```
 */
export function fileExists(filePath: string): boolean {
	try {
		return lstatSync(filePath).isFile();
	} catch (_error) {
		return false;
	}
}
