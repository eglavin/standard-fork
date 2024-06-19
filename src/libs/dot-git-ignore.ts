// https://github.com/bcoe/dotgitignore/blob/master/LICENSE.txt
// https://github.com/bmeck/dotignore
// Extracted from bcoe/dotgitignore which was extracted from bmeck/dotignore.
//
// Licensed as ISC and MIT.

import { readFileSync } from "node:fs";
import path from "node:path";
import { findUpSync } from "find-up";
import { makeRe, type MMRegExp } from "minimatch";

export class DotGitIgnore {
	private matches: (false | MMRegExp | null)[] = [];
	private negated: Record<number, boolean> = {};
	private rooted: Record<number, boolean> = {};

	constructor(cwd: string) {
		const gitIgnorePath = findUpSync(".gitignore", {
			type: "file",
			cwd,
		});

		if (gitIgnorePath) {
			const fileContent = readFileSync(gitIgnorePath, "utf8");
			this.matches = this.createMatches(fileContent);
		}
	}

	private createMatches(fileContent: string): (false | MMRegExp | null)[] {
		return fileContent.split(/\r?\n|\r/).map((line, idx) => {
			const isNegatedLine = line.startsWith("!");
			const isRootedLine = line.startsWith("/");

			if (isNegatedLine || isRootedLine) {
				line = line.substring(1);
			}

			const isEmptyLine = line === "";
			if (isEmptyLine) {
				return null;
			}

			const isShellGlob = line.indexOf("/") >= 0;

			this.negated[idx] = isNegatedLine;
			this.rooted[idx] = isRootedLine || isShellGlob;

			return makeRe(line);
		});
	}

	public shouldIgnore(name: string): boolean {
		let isMatching = false;

		for (let i = 0; i < this.matches.length; i++) {
			const matcher = this.matches[i];
			if (!matcher) {
				continue;
			}

			if (this.rooted[i]) {
				if (matcher.test(name)) {
					isMatching = !this.negated[i];
				}
			} else if (name.split(path.sep).some((part) => matcher.test(part))) {
				isMatching = !this.negated[i];
			}
		}

		return isMatching;
	}
}
