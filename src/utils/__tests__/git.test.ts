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

	it("should not execute if dryRun is enabled", async () => {
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

	it("should log if error is thrown", async () => {
		const { config, createCommits, createJSONFile } = await createTestDir("execute-file");
		const git = new Git(config);

		createJSONFile();
		createCommits();

		expect(async () => await git.add("non-existing-file")).rejects.toThrowError(
			"Command failed: git add non-existing-file\nfatal: pathspec 'non-existing-file' did not match any files",
		);
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
