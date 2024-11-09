import { execSync } from "node:child_process";

import { createTestDir } from "../../../tests/create-test-directory";
import { Git } from "../git";

describe("git", () => {
	it("should accept arguments", async () => {
		const { testFolder, config, createCommits, createJSONFile } =
			await createTestDir("execute-file");
		const git = new Git(config);

		createJSONFile();
		createCommits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: testFolder }).toString();
		expect(log).toMatch(/test: test arguments works/);
	});

	it("should be able to tag commits", async () => {
		const { testFolder, config, createCommits, createJSONFile } =
			await createTestDir("execute-file");
		const git = new Git(config);

		createJSONFile();
		createCommits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");
		await git.tag("v1.0.0", "-m", "test: test arguments works");

		const gitStatus = execSync("git status", { cwd: testFolder }).toString();
		expect(gitStatus).toMatch(/nothing to commit, working tree clean/);
	});

	it("should not commit files if dryRun is enabled", async () => {
		const { testFolder, config, createCommits, createJSONFile } =
			await createTestDir("execute-file");
		config.dryRun = true;
		const git = new Git(config);

		createJSONFile();
		createCommits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: testFolder }).toString();
		expect(log).not.toMatch(/test: test arguments works/);
	});

	it("should not add files if dryRun is enabled", async () => {
		const { testFolder, config, createCommits, createFile } = await createTestDir("execute-file");
		config.dryRun = true;
		const git = new Git(config);

		createFile("\n", "file.txt");
		createCommits();

		await git.add("file.txt");
		const gitStatus = execSync("git status", { cwd: testFolder }).toString();

		expect(gitStatus).toMatch(/Untracked files:/);
		expect(gitStatus).toMatch(/file.txt/);
	});

	it("should not tag commits if dryRun is enabled", async () => {
		const { testFolder, config, createCommits, createJSONFile } =
			await createTestDir("execute-file");
		config.dryRun = true;
		const git = new Git(config);

		createJSONFile();
		createCommits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");
		await git.tag("v1.0.0", "-m", "test: test arguments works");

		expect(() => execSync("git rev-list -n 1 v1.0.0", { cwd: testFolder }).toString()).toThrow();
	});

	it("should log if error is thrown", async () => {
		const { config, createCommits, createJSONFile } = await createTestDir("execute-file");
		const git = new Git(config);

		createJSONFile();
		createCommits();

		expect(async () => await git.add("non-existing-file")).rejects.toThrowError(
			"Command failed: git add non-existing-file\nfatal: pathspec 'non-existing-file' did not match any files",
		);
	});

	it("should be able to get the current branch", async () => {
		const { config, createCommits, createJSONFile } = await createTestDir("execute-file");
		const git = new Git(config);

		createJSONFile();
		createCommits();

		const branch = await git.currentBranch();
		expect(branch).toBe("main");
	});

	it("should check if a file is ignored by git", async () => {
		const { config, createAndCommitFile, createFile, createDirectory } =
			await createTestDir("execute-file");
		const git = new Git(config);

		createAndCommitFile(
			`
src/*.txt
test/**
`,
			".gitignore",
		);

		createDirectory("src");
		createFile("", "src", "my-file.txt");
		createFile("", "src", "my-file.js");
		expect(await git.shouldIgnore("src/my-file.txt")).toBe(true);
		expect(await git.shouldIgnore("src/my-file.js")).toBe(false);

		createDirectory("test");
		createFile("", "test", "my-file.txt");
		expect(await git.shouldIgnore("test/my-file.txt")).toBe(true);
	});
});
