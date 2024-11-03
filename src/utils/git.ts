import { execFile } from "node:child_process";
import type { ForkConfig } from "../config/types";

export class Git {
	constructor(private config: Pick<ForkConfig, "path" | "dryRun">) {
		this.add = this.add.bind(this);
		this.commit = this.commit.bind(this);
		this.tag = this.tag.bind(this);
		this.shouldIgnore = this.shouldIgnore.bind(this);
		this.currentBranch = this.currentBranch.bind(this);
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

	public async shouldIgnore(file: string): Promise<boolean> {
		try {
			await this.execGit("check-ignore", ["--no-index", file]);

			return true;
		} catch (_error) {
			return false;
		}
	}

	public async currentBranch(): Promise<string> {
		return (await this.execGit("rev-parse", ["--abbrev-ref", "HEAD"])).trim();
	}

	private async execGit(command: string, args: string[]): Promise<string> {
		return new Promise((onResolve, onReject) => {
			execFile(
				"git",
				[command, ...args],
				{
					cwd: this.config.path,
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
}
