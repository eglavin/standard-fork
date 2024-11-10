import { writeFileSync } from "node:fs";

import { setupTest } from "../../../tests/setup-tests";
import { commitChanges } from "../commit";

describe("commit", () => {
	it("should commit changed files", async () => {
		const { config, execGit, git, logger, relativeTo } = await setupTest("commit");

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

		await expect(execGit.raw("status", "--porcelain")).resolves.toBe("?? README.md\n"); // README.md should not be committed
	});

	it("should not commit if there are no files to commit", async () => {
		const { config, execGit, git, logger, relativeTo } = await setupTest("commit");

		writeFileSync(relativeTo("README.md"), "Test readme content");

		await commitChanges(config, logger, git, [], "1.2.4");

		await expect(execGit.raw("status", "--porcelain")).resolves.toBe("?? README.md\n"); // README.md should not be committed
	});

	it("should commit all files if commitAll is set to true", async () => {
		const { config, execGit, git, logger, relativeTo } = await setupTest("commit");
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

		await expect(execGit.raw("status", "--porcelain")).resolves.toBe("");
	});

	it("should skip commit", async () => {
		const { config, execGit, git, logger, relativeTo } = await setupTest("commit");
		config.skipCommit = true;

		writeFileSync(relativeTo("package.json"), JSON.stringify({ version: "1.2.3" }));

		await commitChanges(
			config,
			logger,
			git,
			[{ name: "package.json", path: relativeTo("package.json"), version: "1.2.4" }],
			"1.2.4",
		);

		await expect(execGit.raw("status", "--porcelain")).resolves.toBe("?? package.json\n"); // package.json should not be committed
	});
});
