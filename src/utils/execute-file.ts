import { execFile } from "node:child_process";

import type { ForkConfig } from "../configuration/schema";
import type { Logger } from "./logger";

export function createExecute(config: ForkConfig, logger: Logger) {
	/**
	 * Executes a git command with the given arguments and returns the output.
	 */
	async function git(...execArgs: (string | undefined)[]): Promise<string> {
		const args = execArgs.filter(Boolean) as string[];

		logger.debug(`Executing: git ${args.join(" ")}`);

		if (!config.dryRun) {
			return new Promise((resolve, reject) => {
				execFile(
					"git",
					args,
					{
						cwd: config.workingDirectory,
					},
					(error, stdout, stderr) => {
						if (error) {
							logger.error(`git ${args[0]}:`);
							reject(error);
						}

						resolve(stdout ? stdout : stderr);
					},
				);
			});
		}

		return "";
	}

	return {
		git,
	};
}
