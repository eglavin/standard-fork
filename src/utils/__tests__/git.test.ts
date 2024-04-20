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
		} catch (_) {}

		expect(logger.error).toHaveBeenCalledTimes(1);
		expect(logger.error).toHaveBeenCalledWith(expect.stringMatching(/\[git add\] $/));
	});
});
