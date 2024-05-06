import { execFile } from "node:child_process";
import { createTestDir } from "../../../tests/create-test-directory";
import { completedMessage } from "../message";

describe("completedMessage", () => {
	it("should print git push command", async () => {
		const { testFolder, config, logger, createCommit } = await createTestDir("completedMessage");

		createCommit("feat: A feature commit");
		await execFile("git", ["checkout", "-b", "main"], { cwd: testFolder }, () => {});

		await completedMessage(config, logger, [], "minor");

		expect(logger.log).toHaveBeenCalledWith(
			"\nRun `git push --follow-tags origin main` to push the changes and the tag.",
		);
	});

	it("should print npm publish command", async () => {
		const { testFolder, relativeTo, config, logger, createCommit } =
			await createTestDir("completedMessage");

		createCommit("feat: A feature commit");
		await execFile("git", ["checkout", "-b", "main"], { cwd: testFolder }, () => {});

		await completedMessage(
			config,
			logger,
			[
				{
					name: "package.json",
					path: relativeTo("package.json"),
					version: "1.2.4",
					isPrivate: false,
				},
			],
			"minor",
		);

		expect(logger.log).toHaveBeenCalledWith("Run `npm publish` to publish the package.");
	});

	it("should print npm publish command with pre-release tag", async () => {
		const { testFolder, relativeTo, config, logger, createCommit } =
			await createTestDir("completedMessage");

		createCommit("feat: A feature commit");
		await execFile("git", ["checkout", "-b", "main"], { cwd: testFolder }, () => {});

		await completedMessage(
			config,
			logger,
			[
				{
					name: "package.json",
					path: relativeTo("package.json"),
					version: "1.2.4",
					isPrivate: false,
				},
			],
			"preminor",
		);

		expect(logger.log).toHaveBeenCalledWith(
			"Run `npm publish --tag prerelease` to publish the package.",
		);
	});

	it("should print npm publish command with custom pre-release tag", async () => {
		const { testFolder, relativeTo, config, logger, createCommit } =
			await createTestDir("completedMessage");
		config.preRelease = "alpha";

		createCommit("feat: A feature commit");
		await execFile("git", ["checkout", "-b", "main"], { cwd: testFolder }, () => {});

		await completedMessage(
			config,
			logger,
			[
				{
					name: "package.json",
					path: relativeTo("package.json"),
					version: "1.2.4",
					isPrivate: false,
				},
			],
			"preminor",
		);

		expect(logger.log).toHaveBeenCalledWith(
			"Run `npm publish --tag alpha` to publish the package.",
		);
	});
});
