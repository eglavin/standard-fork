import { existsSync, readFileSync } from "node:fs";

import { createTestDir } from "../../../tests/create-test-directory";
import { updateChangelog } from "../changelog";

describe("changelog", () => {
	it("should create changelog file", async () => {
		const { relativeTo, config, logger, createCommit } = await createTestDir("changelog");

		createCommit("feat: A feature commit", "BREAKING CHANGE: A breaking change message");

		expect(existsSync(relativeTo("CHANGELOG.md"))).toBe(false);
		await updateChangelog(config, logger, "1.2.4");
		expect(existsSync(relativeTo("CHANGELOG.md"))).toBe(true);
	});

	it("should update changelog file", async () => {
		const { relativeTo, config, logger, createCommit, createAndCommitFile } =
			await createTestDir("changelog");

		createAndCommitFile(
			`# Test Header

## 1.2.3 (2000-01-01)
`,
			"CHANGELOG.md",
		);
		createCommit("feat: A feature commit", "BREAKING CHANGE: A breaking change message");

		await updateChangelog(config, logger, "1.2.4");

		const changelog = readFileSync(relativeTo("CHANGELOG.md"), "utf-8");
		expect(changelog).toContain("## 1.2.4");
		expect(changelog).toContain("### Features");
		expect(changelog).toContain("A feature commit");
		expect(changelog).toContain("### ⚠ BREAKING CHANGES");
		expect(changelog).toContain("A breaking change message");
	});

	it("should throw an error if header contains a release pattern", async () => {
		const { config, logger, createAndCommitFile, createCommit } = await createTestDir("changelog");
		config.header = "# [1.2.3]\n";

		createAndCommitFile(
			`# Test Header

## 1.2.3 (2000-01-01)
`,
			"CHANGELOG.md",
		);
		createCommit("feat: A feature commit", "BREAKING CHANGE: A breaking change message");

		expect(updateChangelog(config, logger, "1.2.4")).rejects.toThrow(
			"Header cannot contain release pattern",
		);
	});

	it("should not update changelog if dryRun is set", async () => {
		const { relativeTo, config, logger, createAndCommitFile, createCommit } =
			await createTestDir("changelog");
		config.dryRun = true;

		createAndCommitFile(
			`# Test Header

## 1.2.3 (2000-01-01)
`,
			"CHANGELOG.md",
		);
		createCommit("feat: A feature commit", "BREAKING CHANGE: A breaking change message");

		await updateChangelog(config, logger, "1.2.4");

		const changelog = readFileSync(relativeTo("CHANGELOG.md"), "utf-8");
		expect(changelog).toContain("## 1.2.3");
		expect(changelog).not.toContain("## 1.2.4");
	});

	it("should skip changelog update", async () => {
		const { relativeTo, config, logger, createAndCommitFile, createCommit } =
			await createTestDir("changelog");
		config.skipChangelog = true;

		createAndCommitFile(
			`# Test Header

## 1.2.3 (2000-01-01)
`,
			"CHANGELOG.md",
		);

		createCommit("feat: A feature commit", "BREAKING CHANGE: A breaking change message");

		await updateChangelog(config, logger, "1.2.4");

		const changelog = readFileSync(relativeTo("CHANGELOG.md"), "utf-8");
		expect(changelog).toContain("## 1.2.3");
		expect(changelog).not.toContain("## 1.2.4");
	});
});
