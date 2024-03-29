import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTestFolder } from "../../../tests/init-test-folder.js";
import { createTestConfig } from "../../../tests/init-test-options.js";
import { bumpVersion } from "../version.js";

describe("version", () => {
	it('should read and update "package.json"', async () => {
		const { createCommits, createJSONFile, setupGitRepo, deleteTestFolder, tempDir } =
			createTestFolder("version");

		setupGitRepo();
		createJSONFile();
		createCommits();

		const { config, logger } = await createTestConfig(tempDir);

		const result = await bumpVersion(config, logger);
		expect(result).toEqual({
			currentVersion: "1.0.0",
			files: [
				{
					isPrivate: false,
					name: "package.json",
					path: join(tempDir, "package.json"),
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

		deleteTestFolder();
	});

	it('should read and update "package-lock.json"', async () => {
		const { createCommits, createJSONFile, setupGitRepo, deleteTestFolder, tempDir } =
			createTestFolder("version");

		setupGitRepo();
		createJSONFile();
		createJSONFile(
			{
				version: "1.0.0",
				lockfileVersion: 2,
				packages: {
					"": {
						version: "1.0.0",
					},
				},
			},
			"package-lock.json",
		);
		createCommits();

		const { config, logger } = await createTestConfig(tempDir);

		const result = await bumpVersion(config, logger);
		expect(result).toEqual({
			currentVersion: "1.0.0",
			files: [
				{
					isPrivate: false,
					name: "package.json",
					path: join(tempDir, "package.json"),
					type: "package-file",
					version: "1.0.0",
				},
				{
					isPrivate: false,
					name: "package-lock.json",
					path: join(tempDir, "package-lock.json"),
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

		deleteTestFolder();
	});

	it("should determine if the package is private", async () => {
		const { createCommits, createJSONFile, setupGitRepo, deleteTestFolder, tempDir } =
			createTestFolder("version");

		setupGitRepo();
		createJSONFile({ version: "1.0.0", private: true });
		createCommits();

		const { config, logger } = await createTestConfig(tempDir);

		const result = await bumpVersion(config, logger);
		expect(result).toEqual({
			currentVersion: "1.0.0",
			files: [
				{
					isPrivate: true,
					name: "package.json",
					path: join(tempDir, "package.json"),
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

		deleteTestFolder();
	});
});
