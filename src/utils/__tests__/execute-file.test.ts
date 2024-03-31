import { execSync } from "child_process";

import { createTestDir } from "../../../tests/create-test-directory";
import { createTestConfig } from "../../../tests/create-test-config";
import { createExecute } from "../execute-file";

describe("execute-file", () => {
	it("should accept arguments", async () => {
		const { createCommits, createJSONFile, initGitRepo, deleteTestDir, testDir } =
			createTestDir("execute-file");

		initGitRepo();
		createJSONFile();
		createCommits();

		const { config, logger } = await createTestConfig(testDir);
		const { git } = createExecute(config, logger);

		await git("commit", "--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: testDir }).toString();
		expect(
			log.search("test: test arguments works"), // Expect the commit to exist
		).not.toBe(-1);

		deleteTestDir();
	});

	it("should not execute if dryRun is enabled", async () => {
		const { createCommits, createJSONFile, initGitRepo, deleteTestDir, testDir } =
			createTestDir("execute-file");

		initGitRepo();
		createJSONFile();
		createCommits();

		const { config, logger } = await createTestConfig(testDir);
		config.dryRun = true;
		const { git } = createExecute(config, logger);

		await git("commit", "--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: testDir }).toString();
		expect(
			log.search("test: test arguments works"), // Expect the commit to not exist
		).toBe(-1);

		deleteTestDir();
	});

	it("should log if debug is enabled", async () => {
		const { createCommits, createJSONFile, initGitRepo, deleteTestDir, testDir } =
			createTestDir("execute-file");

		initGitRepo();
		createJSONFile();
		createCommits();

		const { config, logger } = await createTestConfig(testDir);
		const { git } = createExecute(config, logger);

		await git("commit", "--allow-empty", "-m", "test: test arguments works");

		expect(logger.debug).toHaveBeenCalledTimes(1);
		expect(logger.debug).toHaveBeenCalledWith(
			expect.stringMatching(/git commit --allow-empty -m test: test arguments works$/),
		);

		deleteTestDir();
	});

	it("should log if error is thrown", async () => {
		const { createCommits, createJSONFile, initGitRepo, deleteTestDir, testDir } =
			createTestDir("execute-file");

		initGitRepo();
		createJSONFile();
		createCommits();

		const { config, logger } = await createTestConfig(testDir);
		const { git } = createExecute(config, logger);

		try {
			await git("add", "non-existing-file");
		} catch (_) {
			// Ignore error
		}

		expect(logger.error).toHaveBeenCalledTimes(1);
		expect(logger.error).toHaveBeenCalledWith(expect.stringMatching(/add:$/));

		deleteTestDir();
	});
});
