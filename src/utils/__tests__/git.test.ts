import { execSync } from "child_process";

import { createTestDir } from "../../../tests/create-test-directory";
import { Git } from "../git";

describe("git", () => {
	it("should accept arguments", async () => {
		const { testDir, createCommits, createJSONFile, createTestConfig } =
			createTestDir("execute-file");

		createJSONFile();
		createCommits();

		const { config, logger } = await createTestConfig();
		const git = new Git(config, logger);

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: testDir }).toString();
		expect(log).toMatch(/test: test arguments works/);
	});

	it("should not execute if dryRun is enabled", async () => {
		const { testDir, createCommits, createJSONFile, createTestConfig } =
			createTestDir("execute-file");

		createJSONFile();
		createCommits();

		const { config, logger } = await createTestConfig();
		config.dryRun = true;
		const git = new Git(config, logger);

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		const log = execSync("git log", { cwd: testDir }).toString();
		expect(log).not.toMatch(/test: test arguments works/);
	});

	it("should log if debug is enabled", async () => {
		const { createCommits, createJSONFile, createTestConfig } = createTestDir("execute-file");

		createJSONFile();
		createCommits();
		const { config, logger } = await createTestConfig();
		const git = new Git(config, logger);

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		expect(logger.debug).toHaveBeenCalledTimes(1);
		expect(logger.debug).toHaveBeenCalledWith(
			expect.stringMatching(/\[git commit\] --allow-empty -m test: test arguments works$/),
		);
	});

	it("should log if error is thrown", async () => {
		const { createCommits, createJSONFile, createTestConfig } = createTestDir("execute-file");

		createJSONFile();
		createCommits();
		const { config, logger } = await createTestConfig();
		const git = new Git(config, logger);

		try {
			await git.add("non-existing-file");
		} catch (_) {}

		expect(logger.error).toHaveBeenCalledTimes(1);
		expect(logger.error).toHaveBeenCalledWith(expect.stringMatching(/\[git add\] $/));
	});
});
