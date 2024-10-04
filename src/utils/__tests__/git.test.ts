import { execSync } from "child_process";

import { createTestDir } from "../../../tests/create-test-directory";
import { Git } from "../git";

describe("git", () => {
	it("should accept arguments", async () => {
		const { testFolder, config, logger, createCommits, createJSONFile } =
			await createTestDir("execute-file");
		const git = new Git(config, logger);

		createJSONFile();
		createCommits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: testFolder }).toString();
		expect(log).toMatch(/test: test arguments works/);
	});

	it("should not execute if dryRun is enabled", async () => {
		const { testFolder, config, logger, createCommits, createJSONFile } =
			await createTestDir("execute-file");
		config.dryRun = true;
		const git = new Git(config, logger);

		createJSONFile();
		createCommits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: testFolder }).toString();
		expect(log).not.toMatch(/test: test arguments works/);
	});

	it("should log if debug is enabled", async () => {
		const { config, logger, createCommits, createJSONFile } = await createTestDir("execute-file");
		const git = new Git(config, logger);

		createJSONFile();
		createCommits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		expect(logger.debug).toHaveBeenCalledTimes(1);
		expect(logger.debug).toHaveBeenCalledWith(
			expect.stringMatching(/\[git commit\] --allow-empty -m test: test arguments works$/),
		);
	});

	it("should log if error is thrown", async () => {
		const { config, logger, createCommits, createJSONFile } = await createTestDir("execute-file");
		const git = new Git(config, logger);

		createJSONFile();
		createCommits();

		try {
			await git.add("non-existing-file");
		} catch (_error) {}

		expect(logger.error).toHaveBeenCalledTimes(1);
		expect(logger.error).toHaveBeenCalledWith(expect.stringMatching(/\[git add\] $/));
	});

	it("should check if a file is ignored by git", async () => {
		const { config, logger, createAndCommitFile, createFile, createDirectory } =
			await createTestDir("execute-file");
		const git = new Git(config, logger);

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
