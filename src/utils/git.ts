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
		this.revParse = this.revParse.bind(this);
	}

	public add(...args: (string | undefined)[]) {
		return this.execGit("add", args.filter(Boolean) as string[]);
	}

	public commit(...args: (string | undefined)[]) {
		return this.execGit("commit", args.filter(Boolean) as string[]);
	}

	public tag(...args: (string | undefined)[]) {
		return this.execGit("tag", args.filter(Boolean) as string[]);
	}

	public revParse(...args: (string | undefined)[]) {
		return this.execGit("rev-parse", args.filter(Boolean) as string[]);
	}

	private execGit(command: string, args: string[]): Promise<string> {
		if (this.config.dryRun) {
			return Promise.resolve("");
		}

		this.logger.debug(`Executing: git ${command} ${args.join(" ")}`);
		return new Promise((onResolve, onReject) => {
			execFile(
				"git",
				[command, ...args],
				{
					cwd: this.config.workingDirectory,
				},
				(error, stdout, stderr) => {
					if (error) {
						this.logger.error(`git ${command}:`);
						onReject(error);
					}

					onResolve(stdout ? stdout : stderr);
				},
			);
		});
	}
}
