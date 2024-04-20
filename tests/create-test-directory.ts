import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { type ExecSyncOptionsWithBufferEncoding, execSync } from "node:child_process";

import { getUserConfig } from "../src";
import { Logger } from "../src/utils/logger";

export async function createTestDir(name: string) {
	const testFolderLocation = join(process.cwd(), "..", "fork-version.tests"); // Need to step up outside of the fork-version repo to avoid git conflicts.
	const testFolder = join(testFolderLocation, `${randomBytes(16).toString("hex")}-${name}`);

	const execSyncOptions: ExecSyncOptionsWithBufferEncoding = {
		cwd: testFolder,
		stdio: "ignore",
	};

	if (!existsSync(testFolder)) {
		mkdirSync(testFolder, { recursive: true });

		if (!existsSync(testFolder)) {
			throw new Error("Unable to create test folder.");
		}
	} else {
		throw new Error(`Test folder already exists: ${testFolder}`);
	}

	execSync("git config --global init.defaultBranch main", execSyncOptions);
	execSync("git init", execSyncOptions);
	execSync("git config commit.gpgSign false", execSyncOptions);
	execSync("git config core.autocrlf false", execSyncOptions);

	const config = await getUserConfig();
	config.path = testFolder;
	config.header = "# Test Header\n";
	config.changelogPresetConfig = {
		...config.changelogPresetConfig,
		types: [
			{ type: "feat", section: "Features" },
			{ type: "fix", section: "Bug Fixes" },
			{ type: "chore", section: "Chore" },
			{ type: "docs", section: "Docs" },
			{ type: "style", section: "Style" },
			{ type: "refactor", section: "Refactor" },
			{ type: "perf", section: "Perf" },
			{ type: "test", section: "Test" },
		],
	};
	config.gitTagFallback = false;

	const logger = new Logger({ silent: true, debug: false, inspectVersion: false });
	logger.log = vi.fn();
	logger.warn = vi.fn();
	logger.error = vi.fn();
	logger.debug = vi.fn();

	return {
		testFolder,
		config,
		logger,

		relativeTo: function _relativeTo(...pathSegments: string[]) {
			return join(testFolder, ...pathSegments);
		},

		createJSONFile: function _createJSONFile(jsObject?: object, file = "package.json") {
			const stringifiedPackage = JSON.stringify(jsObject ?? { version: "1.0.0" }, null, 2);

			writeFileSync(join(testFolder, file), stringifiedPackage, "utf-8");
			execSync(`git add ${file}`, execSyncOptions);
		},

		createFile: function _createFile(content: string, file: string) {
			writeFileSync(join(testFolder, file), content, "utf-8");
			execSync(`git add ${file}`, execSyncOptions);
		},

		createCommits: function _createCommits(commits?: string[]) {
			const testCommits = Array.isArray(commits)
				? commits
				: ["initial commit", "feat: A feature commit", "test: A test commit", "fix: A fix commit"];

			for (const commitMessage of testCommits) {
				execSync(`git commit --allow-empty -m "${commitMessage}"`, execSyncOptions);
			}
		},

		createCommit: function _createCommit(message: string, commitBody?: string) {
			execSync(
				commitBody
					? `git commit --allow-empty -m "${message}" -m "${commitBody}"`
					: `git commit --allow-empty -m "${message}"`,
				execSyncOptions,
			);
		},
	};
}
