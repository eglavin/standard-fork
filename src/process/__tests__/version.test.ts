import { join } from "node:path";

import { createTestDir } from "../../../tests/create-test-directory";
import { createTestConfig } from "../../../tests/create-test-config";
import { bumpVersion } from "../version";

describe("version", () => {
	it('should read and update "package.json"', async () => {
		const { createCommits, createJSONFile, initGitRepo, deleteTestDir, testDir } =
			createTestDir("version");

		initGitRepo();
		createJSONFile();
		createCommits();

		const { config, logger } = await createTestConfig(testDir);

		const result = await bumpVersion(config, logger);
		expect(result).toEqual({
			currentVersion: "1.0.0",
			files: [
				{
					isPrivate: false,
					name: "package.json",
					path: join(testDir, "package.json"),
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

		deleteTestDir();
	});

	it('should read and update "package-lock.json"', async () => {
		const { createCommits, createJSONFile, initGitRepo, deleteTestDir, testDir } =
			createTestDir("version");

		initGitRepo();
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

		const { config, logger } = await createTestConfig(testDir);

		const result = await bumpVersion(config, logger);
		expect(result).toEqual({
			currentVersion: "1.0.0",
			files: [
				{
					isPrivate: false,
					name: "package.json",
					path: join(testDir, "package.json"),
					type: "package-file",
					version: "1.0.0",
				},
				{
					isPrivate: false,
					name: "package-lock.json",
					path: join(testDir, "package-lock.json"),
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

		deleteTestDir();
	});

	it("should determine if the package is private", async () => {
		const { createCommits, createJSONFile, initGitRepo, deleteTestDir, testDir } =
			createTestDir("version");

		initGitRepo();
		createJSONFile({ version: "1.0.0", private: true });
		createCommits();

		const { config, logger } = await createTestConfig(testDir);

		const result = await bumpVersion(config, logger);
		expect(result).toEqual({
			currentVersion: "1.0.0",
			files: [
				{
					isPrivate: true,
					name: "package.json",
					path: join(testDir, "package.json"),
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

		deleteTestDir();
	});
});
