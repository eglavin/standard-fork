import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createTestDir } from "../../../tests/create-test-directory";
import { updateChangelog } from "../changelog";

describe("changelog", () => {
	it("should create changelog file", async () => {
		const { testDir, createCommit, createTestConfig } = createTestDir("changelog");

		createCommit("feat: A feature commit", "BREAKING CHANGE: A breaking change message");

		const { config, logger } = await createTestConfig();

		expect(existsSync(join(testDir, "CHANGELOG.md"))).toBe(false);
		await updateChangelog(config, logger, "1.2.4");
		expect(existsSync(join(testDir, "CHANGELOG.md"))).toBe(true);
	});

	it("should update changelog file", async () => {
		const { testDir, createCommit, createFile, createTestConfig } = createTestDir("changelog");

		createFile(
			`# Test Header

## 1.2.3 (2000-01-01)
`,
			"CHANGELOG.md",
		);
		createCommit("feat: A feature commit", "BREAKING CHANGE: A breaking change message");

		const { config, logger } = await createTestConfig();

		await updateChangelog(config, logger, "1.2.4");
		const changelog = readFileSync(join(testDir, "CHANGELOG.md"), "utf-8");

		expect(changelog).toContain("## 1.2.4");
		expect(changelog).toContain("### Features");
		expect(changelog).toContain("A feature commit");
		expect(changelog).toContain("### ⚠ BREAKING CHANGES");
		expect(changelog).toContain("A breaking change message");
	});

	it("should throw an error if header contains a release pattern", async () => {
		const { createFile, createCommit, createTestConfig } = createTestDir("changelog");

		createFile(
			`# Test Header

## 1.2.3 (2000-01-01)
`,
			"CHANGELOG.md",
		);
		createCommit("feat: A feature commit", "BREAKING CHANGE: A breaking change message");

		const { config, logger } = await createTestConfig();
		config.header = "# [1.2.3]\n";

		expect(updateChangelog(config, logger, "1.2.4")).rejects.toThrow(
			"Header cannot contain release pattern",
		);
	});

	it("should not update changelog if dryRun is set", async () => {
		const { testDir, createFile, createCommit, createTestConfig } = createTestDir("changelog");

		createFile(
			`# Test Header

## 1.2.3 (2000-01-01)
`,
			"CHANGELOG.md",
		);
		createCommit("feat: A feature commit", "BREAKING CHANGE: A breaking change message");

		const { config, logger } = await createTestConfig();
		config.dryRun = true;

		await updateChangelog(config, logger, "1.2.4");

		const changelog = readFileSync(join(testDir, "CHANGELOG.md"), "utf-8");
		expect(changelog).toContain("## 1.2.3");
		expect(changelog).not.toContain("## 1.2.4");
	});
});
