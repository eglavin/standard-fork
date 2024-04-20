import { execFile } from "node:child_process";

import { createTestDir } from "../../../tests/create-test-directory";
import { tagChanges } from "../tag";

describe("tagChanges", () => {
	it("should create a tag", async () => {
		const { testFolder, config, logger, createCommit } = await createTestDir("tagChanges");

		await execFile("git", ["checkout", "-b", "main"], { cwd: testFolder }, () => {});
		createCommit("feat: A feature commit");

		await tagChanges(config, logger, "1.2.4");

		await execFile("git", ["tag"], { cwd: testFolder }, (_error, stdout, _stderr) => {
			expect(stdout).toContain("v1.2.4");
		});
	});

	it("should throw an error if the tag already exists", async () => {
		const { testFolder, config, logger, createCommit } = await createTestDir("tagChanges");

		await execFile("git", ["checkout", "-b", "main"], { cwd: testFolder }, () => {});
		createCommit("feat: A feature commit");

		expect(
			(async () => {
				await tagChanges(config, logger, "1.2.4");
				await tagChanges(config, logger, "1.2.4");
			})(),
		).rejects.toThrow("tag 'v1.2.4' already exists");
	});
});
