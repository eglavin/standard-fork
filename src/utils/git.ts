import { execFile } from "node:child_process";
import type { ForkConfig } from "../config/schema";
import type { Logger } from "./logger";

export class Git {
	constructor(
		private config: ForkConfig,
		private logger: Logger,
	) {
		this.add = this.add.bind(this);
		this.commit = this.commit.bind(this);
		this.tag = this.tag.bind(this);
		this.currentBranch = this.currentBranch.bind(this);
	}

	public add(...args: (string | undefined)[]) {
		if (this.config.dryRun) {
			return Promise.resolve("");
		}

		return this.execGit("add", args.filter(Boolean) as string[]);
	}

	public commit(...args: (string | undefined)[]) {
		if (this.config.dryRun) {
			return Promise.resolve("");
		}

		return this.execGit("commit", args.filter(Boolean) as string[]);
	}

	public tag(...args: (string | undefined)[]) {
		if (this.config.dryRun) {
			return Promise.resolve("");
		}

		return this.execGit("tag", args.filter(Boolean) as string[]);
	}

	public async currentBranch() {
		return (await this.execGit("rev-parse", ["--abbrev-ref", "HEAD"])).trim();
	}

	private execGit(command: string, args: string[]): Promise<string> {
		this.logger.debug(`[git ${command}] ${args.join(" ")}`);

		return new Promise((onResolve, onReject) => {
			execFile(
				"git",
				[command, ...args],
				{
					cwd: this.config.path,
				},
				(error, stdout, stderr) => {
					if (error) {
						this.logger.error(`[git ${command}] `);
						onReject(error);
					}

					onResolve(stdout ? stdout : stderr);
				},
			);
		});
	}
}
