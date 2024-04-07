import { execFile } from "node:child_process";

import { createTestDir } from "../../../tests/create-test-directory";
import { tagChanges } from "../tag";

describe("tagChanges", () => {
	it("should create a tag", async () => {
		const { testDir, createCommit, deleteTestDir, createTestConfig } = createTestDir("tagChanges");
		const { config, logger } = await createTestConfig();

		await execFile("git", ["checkout", "-b", "main"], { cwd: testDir }, () => {});
		createCommit("feat: A feature commit");

		await tagChanges(config, logger, "1.2.4");

		execFile("git", ["tag"], { cwd: testDir }, (error, stdout) =>
			expect(stdout).toContain("v1.2.4"),
		);

		deleteTestDir();
	});

	it("should throw an error if the tag already exists", async () => {
		const { testDir, createTestConfig, createCommit, deleteTestDir } = createTestDir("tagChanges");
		const { config, logger } = await createTestConfig();

		await execFile("git", ["checkout", "-b", "main"], { cwd: testDir }, () => {});
		createCommit("feat: A feature commit");

		await tagChanges(config, logger, "1.2.4");

		expect(tagChanges(config, logger, "1.2.4")).rejects.toThrow(/tag 'v1.2.4' already exists/);

		deleteTestDir();
	});
});
