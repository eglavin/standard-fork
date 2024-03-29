import { join } from "node:path";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { ExecSyncOptionsWithBufferEncoding, execSync } from "node:child_process";

export function createTestFolder(testName: string) {
	const tempDirLocation = join(process.cwd(), "..", ".temp");
	const tempFolderName = `fork-version-${Date.now()}-${testName}`;
	const tempDir = join(tempDirLocation, tempFolderName);

	const execSyncOptions: ExecSyncOptionsWithBufferEncoding = {
		cwd: tempDir,
		stdio: "ignore",
	};

	if (!existsSync(tempDir)) {
		mkdirSync(tempDir, { recursive: true });

		if (!existsSync(tempDir)) throw new Error("Unable to create test folder.");
	} else throw new Error(`Test folder already exists: ${tempDir}`);

	function setupGitRepo() {
		execSync("git init", execSyncOptions);
		execSync("git config commit.gpgSign false", execSyncOptions);
		execSync("git config core.autocrlf false", execSyncOptions);
	}

	function createJSONFile(jsonObject?: object, file = "package.json") {
		const stringifiedPackage = JSON.stringify(jsonObject ?? { version: "1.0.0" }, null, 2);

		writeFileSync(join(tempDir, file), stringifiedPackage, "utf-8");
		execSync(`git add ${file}`, execSyncOptions);
	}

	function createCommits(commits?: string[]) {
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
	}

	function deleteTestFolder() {
		rmSync(tempDir, { recursive: true, force: true });
	}

	return {
		tempFolderName,
		tempDir,

		setupGitRepo,
		createJSONFile,
		createCommits,
		deleteTestFolder,
	};
}
