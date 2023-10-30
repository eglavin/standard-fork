import { describe, expect, it } from "vitest";
import { execSync } from "child_process";
import { createTestFolder } from "../../../tests/init-test-folder.js";
import { createTestConfig } from "../../../tests/init-test-options.js";
import { createExecute } from "../execute-file.js";

describe("execute-file", () => {
	it("should accept arguments", async () => {
		const { createCommits, createJSONFile, setupGitRepo, deleteTestFolder, tempDir } =
			createTestFolder("execute-file");

		setupGitRepo();
		createJSONFile();
		createCommits();

		const config = await createTestConfig(tempDir);
		const { git } = createExecute(config);

		await git("commit", "--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: tempDir }).toString();
		expect(
			log.search("test: test arguments works"), // Expect the commit to exist
		).not.toBe(-1);

		deleteTestFolder();
	});

	it("should not execute if dryRun is enabled", async () => {
		const { createCommits, createJSONFile, setupGitRepo, deleteTestFolder, tempDir } =
			createTestFolder("execute-file");

		setupGitRepo();
		createJSONFile();
		createCommits();

		const config = await createTestConfig(tempDir);
		config.dryRun = true;
		const { git } = createExecute(config);

		await git("commit", "--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: tempDir }).toString();
		expect(
			log.search("test: test arguments works"), // Expect the commit to not exist
		).toBe(-1);

		deleteTestFolder();
	});

	it("should log if debug is enabled", async () => {
		const { createCommits, createJSONFile, setupGitRepo, deleteTestFolder, tempDir } =
			createTestFolder("execute-file");

		setupGitRepo();
		createJSONFile();
		createCommits();

		const config = await createTestConfig(tempDir);
		const { git } = createExecute(config);

		await git("commit", "--allow-empty", "-m", "test: test arguments works");

		expect(config.debug).toHaveBeenCalledTimes(1);
		expect(config.debug).toHaveBeenCalledWith(
			expect.stringMatching(/git commit --allow-empty -m test: test arguments works$/),
		);

		deleteTestFolder();
	});

	it("should log if error is thrown", async () => {
		const { createCommits, createJSONFile, setupGitRepo, deleteTestFolder, tempDir } =
			createTestFolder("execute-file");

		setupGitRepo();
		createJSONFile();
		createCommits();

		const config = await createTestConfig(tempDir);
		const { git } = createExecute(config);

		try {
			await git("add", "non-existing-file");
		} catch (_) {
			// Ignore error
		}

		expect(config.error).toHaveBeenCalledTimes(1);
		expect(config.error).toHaveBeenCalledWith(expect.stringMatching(/add:$/));

		deleteTestFolder();
	});
});
