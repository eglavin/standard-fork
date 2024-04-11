import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFile } from "node:child_process";

import { createTestDir } from "../../../tests/create-test-directory";
import { commitChanges } from "../commit";

describe("commit", () => {
	it("should commit changed files", async () => {
		const { testDir, createTestConfig } = createTestDir("commit");

		const { config, logger } = await createTestConfig();

		writeFileSync(join(testDir, "CHANGELOG.md"), "Test content");
		writeFileSync(join(testDir, "package.json"), JSON.stringify({ version: "1.2.3" }));
		writeFileSync(join(testDir, "README.md"), "Test readme content");

		await commitChanges(
			config,
			logger,
			[
				{ name: "CHANGELOG.md", path: join(testDir, "CHANGELOG.md"), version: "1.2.4" },
				{ name: "package.json", path: join(testDir, "package.json"), version: "1.2.4" },
			],
			"1.2.4",
		);

		await execFile(
			"git",
			["status", "--porcelain"],
			{
				cwd: testDir,
			},
			(error, stdout) => expect(stdout).toContain("?? README.md"),
		);
	});

	it("should not commit if there are no files to commit", async () => {
		const { testDir, createTestConfig } = createTestDir("commit");

		const { config, logger } = await createTestConfig();

		writeFileSync(join(testDir, "README.md"), "Test readme content");

		await commitChanges(config, logger, [], "1.2.4");

		await execFile(
			"git",
			["status", "--porcelain"],
			{
				cwd: testDir,
			},
			(error, stdout) => expect(stdout).toContain(""),
		);
	});

	it("should commit all files if commitAll is set to true", async () => {
		const { testDir, createTestConfig } = createTestDir("commit");

		const { config, logger } = await createTestConfig();
		config.commitAll = true;

		writeFileSync(join(testDir, "CHANGELOG.md"), "Test content");
		writeFileSync(join(testDir, "package.json"), JSON.stringify({ version: "1.2.3" }));
		writeFileSync(join(testDir, "README.md"), "Test readme content");

		await commitChanges(
			config,
			logger,
			[
				{ name: "CHANGELOG.md", path: join(testDir, "CHANGELOG.md"), version: "1.2.4" },
				{ name: "package.json", path: join(testDir, "package.json"), version: "1.2.4" },
			],
			"1.2.4",
		);

		await execFile(
			"git",
			["status", "--porcelain"],
			{
				cwd: testDir,
			},
			(error, stdout) => expect(stdout).toBe(""),
		);
	});
});
