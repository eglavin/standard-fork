import { execFile } from "node:child_process";
import type { ForkConfigOptions } from "../configuration.js";

export function createExecute(options: ForkConfigOptions) {
	/**
	 * Executes a git command with the given arguments and returns the output.
	 */
	async function executeGit(...execArgs: (string | undefined)[]): Promise<string> {
		const args = execArgs.filter(Boolean) as string[];

		options.log(`Executing: git ${args.join(" ")}`);

		if (!options.dryRun) {
			return new Promise((resolve, reject) => {
				execFile("git", args, (error, stdout, stderr) => {
					if (error) {
						reject(error);
						return;
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
