import { describe, expect, it } from "vitest";
import { createTestFolder } from "../../../tests/init-test-folder.js";

import { bumpVersion } from "../version.js";
import { createTestConfig } from "../../../tests/init-test-options.js";

describe("version", () => {
	it("should read and update version from package.json", async () => {
		const { createCommits, createPackageJson, setupGitRepo, deleteTempFolder, tempDir } =
			createTestFolder("version");

		setupGitRepo();
		createPackageJson();
		createCommits();

		const testConfig = await createTestConfig(tempDir);

		const result = await bumpVersion(testConfig);
		expect(result).toEqual({
			currentVersion: "1.0.0",
			files: [
				{
					isPrivate: false,
					name: "package.json",
					path: `${tempDir}\\package.json`,
					type: "package-file",
					version: "1.0.0",
				},
			],
			nextVersion: "1.0.1",
			level: 2,
			preMajor: false,
			reason: "There are 0 BREAKING CHANGES and 0 features",
			releaseType: "patch",
		});

		deleteTempFolder();
	});
});
