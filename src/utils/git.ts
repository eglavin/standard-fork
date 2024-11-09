import { execFile } from "node:child_process";
import semver from "semver";
import type { ForkConfig } from "../config/types";

export class Git {
	constructor(private config: Pick<ForkConfig, "path" | "dryRun">) {
		this.add = this.add.bind(this);
		this.commit = this.commit.bind(this);
		this.tag = this.tag.bind(this);
		this.isIgnored = this.isIgnored.bind(this);
		this.getCurrentBranchName = this.getCurrentBranchName.bind(this);
		this.getTags = this.getTags.bind(this);
		this.getLatestTag = this.getLatestTag.bind(this);
	}

	private async execGit(command: string, args: string[]): Promise<string> {
		return new Promise((onResolve, onReject) => {
			execFile(
				"git",
				[command, ...args],
				{
					cwd: this.config.path,
					maxBuffer: Infinity,
				},
				(error, stdout, stderr) => {
					if (error) {
						onReject(error);
					} else {
						onResolve(stdout ? stdout : stderr);
					}
				},
			);
		});
	}

	public async add(...args: (string | undefined)[]): Promise<string> {
		if (this.config.dryRun) {
			return "";
		}

		return this.execGit("add", args.filter(Boolean) as string[]);
	}

	public async commit(...args: (string | undefined)[]): Promise<string> {
		if (this.config.dryRun) {
			return "";
		}

		return this.execGit("commit", args.filter(Boolean) as string[]);
	}

	public async tag(...args: (string | undefined)[]): Promise<string> {
		if (this.config.dryRun) {
			return "";
		}

		return this.execGit("tag", args.filter(Boolean) as string[]);
	}

	public async isIgnored(file: string): Promise<boolean> {
		try {
			await this.execGit("check-ignore", ["--no-index", file]);

			return true;
		} catch (_error) {
			return false;
		}
	}

	public async getCurrentBranchName(): Promise<string> {
		return (await this.execGit("rev-parse", ["--abbrev-ref", "HEAD"])).trim();
	}

	/**
	 * `getTags` returns valid semver version tags in order of the commit history.
	 *
	 * Using `git log` to get the commit history, we then parse the tags from the
	 * commit details which is expected to be in the following format:
	 * @example
	 * ```txt
	 * commit 3841b1d05750d42197fe958e3d8e06df378a842d (HEAD -> main, tag: 1.0.2)
	 * Author: Username <username@example.com>
	 * Date:   Sat Nov 9 15:00:00 2024 +0000
	 *
	 *     chore(release): 1.2.3
	 * ```
	 *
	 * - [Functionality extracted from the conventional-changelog - git-semver-tags project](https://github.com/conventional-changelog/conventional-changelog/blob/fac8045242099c016f5f3905e54e02b7d466bd7b/packages/git-semver-tags/index.js)
	 * - [conventional-changelog git-semver-tags MIT Licence](https://github.com/conventional-changelog/conventional-changelog/blob/fac8045242099c016f5f3905e54e02b7d466bd7b/packages/git-semver-tags/LICENSE.md)
	 */
	public async getTags(tagPrefix: string | undefined): Promise<string[]> {
		const logOutput = await this.execGit("log", ["--decorate", "--no-color", "--date-order"]);

		/**
		 * Search for tags in the following formats:
		 * @example "tag: 1.2.3," or "tag: 1.2.3)"
		 */
		const TAG_REGEX = /tag:\s*(.+?)[,)]/gi;

		const tags: string[] = [];
		let match: RegExpExecArray | null = null;
		let tag: string;
		let tagWithoutPrefix: string;

		for (const logOutputLine of logOutput.split("\n")) {
			while ((match = TAG_REGEX.exec(logOutputLine))) {
				tag = match[1];

				if (tagPrefix) {
					if (tag.startsWith(tagPrefix)) {
						tagWithoutPrefix = tag.replace(tagPrefix, "");

						if (semver.valid(tagWithoutPrefix)) {
							tags.push(tag);
						}
					}
				} else if (semver.valid(tag)) {
					tags.push(tag);
				}
			}
		}

		return tags;
	}

	public async getLatestTag(tagPrefix: string | undefined): Promise<string> {
		const tags = await this.getTags(tagPrefix);
		if (!tags.length) return "";

		const cleanedTags = [];
		for (const tag of tags) {
			const cleanedTag = semver.clean(tag.replace(new RegExp(`^${tagPrefix}`), ""));
			if (cleanedTag) {
				cleanedTags.push(cleanedTag);
			}
		}

		return cleanedTags.sort(semver.rcompare)[0];
	}
}
