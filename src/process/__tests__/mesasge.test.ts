import { execFile } from "node:child_process";
import { join } from "node:path";
import { createTestDir } from "../../../tests/create-test-directory";
import { completedMessage } from "../message";

describe("completedMessage", () => {
	it("should print git push command", async () => {
		const { testDir, createCommit, deleteTestDir, createTestConfig } =
			createTestDir("completedMessage");
		const { config, logger } = await createTestConfig();

		createCommit("feat: A feature commit");
		await execFile("git", ["checkout", "-b", "main"], { cwd: testDir }, () => {});

		await completedMessage(config, logger, [], "minor");

		expect(logger.log).toHaveBeenCalledWith(
			"Run `git push --follow-tags origin main` to push the changes and the tag.",
		);

		deleteTestDir();
	});

	it("should print npm publish command", async () => {
		const { testDir, createCommit, deleteTestDir, createTestConfig } =
			createTestDir("completedMessage");
		const { config, logger } = await createTestConfig();

		createCommit("feat: A feature commit");
		await execFile("git", ["checkout", "-b", "main"], { cwd: testDir }, () => {});

		await completedMessage(
			config,
			logger,
			[
				{
					name: "package.json",
					path: join(testDir, "package.json"),
					version: "1.2.4",
					isPrivate: false,
				},
			],
			"minor",
		);

		expect(logger.log).toHaveBeenCalledWith("Run `npm publish` to publish the package.");

		deleteTestDir();
	});

	it("should print npm publish command with pre-release tag", async () => {
		const { testDir, createCommit, deleteTestDir, createTestConfig } =
			createTestDir("completedMessage");
		const { config, logger } = await createTestConfig();

		createCommit("feat: A feature commit");
		await execFile("git", ["checkout", "-b", "main"], { cwd: testDir }, () => {});

		await completedMessage(
			config,
			logger,
			[
				{
					name: "package.json",
					path: join(testDir, "package.json"),
					version: "1.2.4",
					isPrivate: false,
				},
			],
			"preminor",
		);

		expect(logger.log).toHaveBeenCalledWith(
			"Run `npm publish --tag prerelease` to publish the package.",
		);

		deleteTestDir();
	});

	it("should print npm publish command with custom pre-release tag", async () => {
		const { testDir, createCommit, deleteTestDir, createTestConfig } =
			createTestDir("completedMessage");
		const { config, logger } = await createTestConfig();
		config.preReleaseTag = "alpha";

		createCommit("feat: A feature commit");
		await execFile("git", ["checkout", "-b", "main"], { cwd: testDir }, () => {});

		await completedMessage(
			config,
			logger,
			[
				{
					name: "package.json",
					path: join(testDir, "package.json"),
					version: "1.2.4",
					isPrivate: false,
				},
			],
			"preminor",
		);

		expect(logger.log).toHaveBeenCalledWith(
			"Run `npm publish --tag alpha` to publish the package.",
		);

		deleteTestDir();
	});
});
