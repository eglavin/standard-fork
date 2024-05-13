import { writeFileSync } from "node:fs";
import { execFile } from "node:child_process";

import { createTestDir } from "../../../tests/create-test-directory";
import { commitChanges } from "../commit";

describe("commit", () => {
	it("should commit changed files", async () => {
		const { testFolder, relativeTo, config, logger, git } = await createTestDir("commit");

		writeFileSync(relativeTo("CHANGELOG.md"), "Test content");
		writeFileSync(relativeTo("package.json"), JSON.stringify({ version: "1.2.3" }));
		writeFileSync(relativeTo("README.md"), "Test readme content");

		await commitChanges(
			config,
			logger,
			git,
			[
				{ name: "CHANGELOG.md", path: relativeTo("CHANGELOG.md"), version: "1.2.4" },
				{ name: "package.json", path: relativeTo("package.json"), version: "1.2.4" },
			],
			"1.2.4",
		);

		await execFile(
			"git",
			["status", "--porcelain"],
			{
				cwd: testFolder,
			},
			(error, stdout) => expect(stdout).toContain("?? README.md"),
		);
	});

	it("should not commit if there are no files to commit", async () => {
		const { testFolder, relativeTo, config, logger, git } = await createTestDir("commit");

		writeFileSync(relativeTo("README.md"), "Test readme content");

		await commitChanges(config, logger, git, [], "1.2.4");

		await execFile(
			"git",
			["status", "--porcelain"],
			{
				cwd: testFolder,
			},
			(error, stdout) => expect(stdout).toContain(""),
		);
	});

	it("should commit all files if commitAll is set to true", async () => {
		const { testFolder, relativeTo, config, logger, git } = await createTestDir("commit");
		config.commitAll = true;

		writeFileSync(relativeTo("CHANGELOG.md"), "Test content");
		writeFileSync(relativeTo("package.json"), JSON.stringify({ version: "1.2.3" }));
		writeFileSync(relativeTo("README.md"), "Test readme content");

		await commitChanges(
			config,
			logger,
			git,
			[
				{ name: "CHANGELOG.md", path: relativeTo("CHANGELOG.md"), version: "1.2.4" },
				{ name: "package.json", path: relativeTo("package.json"), version: "1.2.4" },
			],
			"1.2.4",
		);

		await execFile(
			"git",
			["status", "--porcelain"],
			{
				cwd: testFolder,
			},
			(error, stdout) => expect(stdout).toBe(""),
		);
	});

	it("should skip commit", async () => {
		const { testFolder, relativeTo, config, logger, git } = await createTestDir("commit");
		config.skipCommit = true;

		writeFileSync(relativeTo("package.json"), JSON.stringify({ version: "1.2.3" }));

		await commitChanges(
			config,
			logger,
			git,
			[{ name: "package.json", path: relativeTo("package.json"), version: "1.2.4" }],
			"1.2.4",
		);

		await execFile(
			"git",
			["status", "--porcelain"],
			{
				cwd: testFolder,
			},
			(error, stdout) => expect(stdout).toContain("?? package.json\n"),
		);
	});
});
