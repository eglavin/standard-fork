import { execFile } from "node:child_process";
import type { ForkConfig } from "../configuration.js";

export function createExecute(config: ForkConfig) {
	/**
	 * Executes a git command with the given arguments and returns the output.
	 */
	async function git(...execArgs: (string | undefined)[]): Promise<string> {
		const args = execArgs.filter(Boolean) as string[];

		config.debug(`Executing: git ${args.join(" ")}`);

		if (!config.dryRun) {
			return new Promise((resolve) => {
				execFile("git", args, (error, stdout, stderr) => {
					if (error) {
						config.error(`git ${args[0]}:`);
						throw error;
					}

					resolve(stdout ? stdout : stderr);
				});
			});
		}

		return "";
	}

	return {
		git,
	};
}
