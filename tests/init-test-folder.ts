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
	} else throw new Error("Test folder already exists.");

	function setupGitRepo() {
		execSync("git init", execSyncOptions);
		execSync("git config commit.gpgSign false", execSyncOptions);
		execSync("git config core.autocrlf false", execSyncOptions);
	}

	function createPackageJson(packageJson?: object) {
		const stringifiedPackage = JSON.stringify(packageJson || { version: "1.0.0" }, null, 2);

		writeFileSync(join(tempDir, "package.json"), stringifiedPackage, "utf-8");
		execSync("git add package.json", execSyncOptions);
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

		for (let index = 0; index < TestCommits.length; index++) {
			const commitMessage = TestCommits[index];

			execSync(`git commit --allow-empty -m "${commitMessage}"`, execSyncOptions);
		}
	}

	function deleteTempFolder() {
		rmSync(tempDir, { recursive: true, force: true });
	}

	return {
		tempFolderName,
		tempDir,

		setupGitRepo,
		createPackageJson,
		createCommits,
		deleteTempFolder,
	};
}
