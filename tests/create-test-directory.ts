import { join } from "node:path";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { type ExecSyncOptionsWithBufferEncoding, execSync } from "node:child_process";

export function createTestDir(testName: string) {
	const testLocation = join(process.cwd(), "..", "fork-version.tests"); // Need to step up outside of the fork-version repo to avoid git conflicts.
	const testDirName = `${Date.now()}-${testName}`;
	const testDir = join(testLocation, testDirName);

	const execSyncOptions: ExecSyncOptionsWithBufferEncoding = {
		cwd: testDir,
		stdio: "ignore",
	};

	if (!existsSync(testDir)) {
		mkdirSync(testDir, { recursive: true });

		if (!existsSync(testDir)) {
			throw new Error("Unable to create test folder.");
		}
	} else {
		throw new Error(`Test folder already exists: ${testDir}`);
	}

	return {
		testDirName,
		testDir,

		/** Delete the created test folder. */
		deleteTestDir: function _deleteTestDir() {
			rmSync(testDir, { recursive: true, force: true });
		},

		/** Initialize a git repository in the test folder. */
		initGitRepo: function _initGitRepo() {
			execSync("git init", execSyncOptions);
			execSync("git config commit.gpgSign false", execSyncOptions);
			execSync("git config core.autocrlf false", execSyncOptions);
		},

		/** Create commits in the test directory. */
		createCommits: function _createCommits(commits?: string[]) {
			const TestCommits = Array.isArray(commits)
				? commits
				: [
						"initial commit",
						"feat: A feature commit.",
						"perf: A performance change.",
						"chore: A chore commit.",
						"ci: A ci commit.",
						"custom: A custom commit.",
					];

			for (const commitMessage of TestCommits) {
				execSync(`git commit --allow-empty -m "${commitMessage}"`, execSyncOptions);
			}
		},

		/** Create a JSON file in the test directory. */
		createJSONFile: function _createJSONFile(jsObject?: object, file = "package.json") {
			const stringifiedPackage = JSON.stringify(jsObject ?? { version: "1.0.0" }, null, 2);

			writeFileSync(join(testDir, file), stringifiedPackage, "utf-8");
			execSync(`git add ${file}`, execSyncOptions);
		},
	};
}
