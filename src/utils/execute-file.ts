import { execFile } from "node:child_process";
import type { ForkConfigOptions } from "../configuration.js";

export function createExecute(options: ForkConfigOptions) {
	/**
	 * Executes a git command with the given arguments and returns the output.
	 */
	async function executeGit(...execArgs: (string | undefined)[]): Promise<string> {
		const args = execArgs.filter(Boolean) as string[];

		options.debug(`Executing: git ${args.join(" ")}`);

		if (!options.dryRun) {
			return new Promise((resolve) => {
				execFile("git", args, (error, stdout, stderr) => {
					if (error) {
						options.error(`git ${args[0]}:`);
						throw error;
					}

					resolve(stdout ? stdout : stderr);
				});
			});
		}

		return "";
	}

	return {
		executeGit,
	};
}
