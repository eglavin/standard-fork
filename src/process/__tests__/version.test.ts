import { join } from "node:path";

import { createTestDir } from "../../../tests/create-test-directory";
import { getCurrentVersion, getNextVersion } from "../version";
import { FileManager } from "../../strategies/file-manager";

describe("version > getCurrentVersion", () => {
	it("should be able to read package.json", async () => {
		const { testDir, createJSONFile, createCommits, deleteTestDir, createTestConfig } =
			createTestDir("version getCurrentVersion");

		createJSONFile({ version: "1.2.3" });
		createCommits();

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		const result = await getCurrentVersion(config, fileManager);
		expect(result).toEqual({
			files: [
				{
					name: "package.json",
					path: join(testDir, "package.json"),
					version: "1.2.3",
					isPrivate: true,
				},
			],
			version: "1.2.3",
		});

		deleteTestDir();
	});

	it("should determine the package is private", async () => {
		const { testDir, createJSONFile, createCommits, deleteTestDir, createTestConfig } =
			createTestDir("version getCurrentVersion");

		createJSONFile({ version: "1.2.3", private: true });
		createCommits();

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		const result = await getCurrentVersion(config, fileManager);
		expect(result).toEqual({
			files: [
				{
					name: "package.json",
					path: join(testDir, "package.json"),
					version: "1.2.3",
					isPrivate: true,
				},
			],
			version: "1.2.3",
		});

		deleteTestDir();
	});

	it("should be able to read package-lock.json", async () => {
		const { testDir, createJSONFile, createCommits, deleteTestDir, createTestConfig } =
			createTestDir("version getCurrentVersion");

		createJSONFile({ version: "1.2.3" });
		createJSONFile(
			{
				version: "1.2.3",
				lockfileVersion: 2,
				packages: { "": { version: "1.2.3" } },
			},
			"package-lock.json",
		);
		createCommits();

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		const result = await getCurrentVersion(config, fileManager);
		expect(result).toEqual({
			files: [
				{
					name: "package.json",
					path: join(testDir, "package.json"),
					version: "1.2.3",
					isPrivate: true,
				},
				{
					name: "package-lock.json",
					path: join(testDir, "package-lock.json"),
					version: "1.2.3",
					isPrivate: true,
				},
			],
			version: "1.2.3",
		});

		deleteTestDir();
	});

	it("should throw an error if multiple versions found", async () => {
		const { createJSONFile, createCommits, deleteTestDir, createTestConfig } = createTestDir(
			"version getCurrentVersion",
		);

		createJSONFile({ version: "1.2.3" });
		createJSONFile({ version: "3.2.1" }, "package-lock.json");
		createCommits();

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		expect(getCurrentVersion(config, fileManager)).rejects.toThrow("Found multiple versions");

		deleteTestDir();
	});

	it("should throw an error if no version found", async () => {
		const { deleteTestDir, createTestConfig } = createTestDir("getCurrentVersion");

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		expect(getCurrentVersion(config, fileManager)).rejects.toThrow(
			"Unable to find current version",
		);

		deleteTestDir();
	});

	it("should be able to define the current version using the config", async () => {
		const { testDir, createJSONFile, createCommits, deleteTestDir, createTestConfig } =
			createTestDir("version getCurrentVersion");

		createJSONFile({ version: "1.2.3" });
		createCommits();

		const { config, logger } = await createTestConfig();
		config.currentVersion = "3.2.1";
		const fileManager = new FileManager(config, logger);

		const result = await getCurrentVersion(config, fileManager);
		expect(result).toEqual({
			files: [
				{
					name: "package.json",
					path: join(testDir, "package.json"),
					version: "1.2.3",
					isPrivate: true,
				},
			],
			version: "3.2.1",
		});

		deleteTestDir();
	});

	it("should log the version and exit if inspectVersion set", async () => {
		const spyOnConsole = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const spyOnProcess = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

		const { createJSONFile, createCommits, deleteTestDir, createTestConfig } = createTestDir(
			"version getCurrentVersion",
		);

		createJSONFile({ version: "1.2.3" });
		createCommits();

		const { config, logger } = await createTestConfig();
		config.inspectVersion = true;
		const fileManager = new FileManager(config, logger);

		await getCurrentVersion(config, fileManager);
		expect(spyOnConsole).toHaveBeenCalledWith("1.2.3");
		expect(spyOnProcess).toHaveBeenCalledWith(0);
		spyOnConsole.mockRestore();
		spyOnProcess.mockRestore();

		deleteTestDir();
	});
});

describe("version > getNextVersion", () => {
	it("should determine the next version as a minor bump", async () => {
		const { createJSONFile, createCommits, deleteTestDir, createTestConfig } =
			createTestDir("version getNextVersion");

		createJSONFile({ version: "1.2.3" });
		createCommits(["feat: A feature commit"]);

		const { config } = await createTestConfig();

		const result = await getNextVersion(config, "1.2.3");
		expect(result).toEqual({
			level: 1,
			preMajor: false,
			reason: "There are 0 BREAKING CHANGES and 1 features",
			releaseType: "minor",
			version: "1.3.0",
		});

		deleteTestDir();
	});

	it("should throw an error if not able to determine the next version", async () => {
		const { createTestConfig, deleteTestDir } = createTestDir("version getNextVersion");

		const { config } = await createTestConfig();

		expect(getNextVersion(config, "1.2.3")).rejects.toThrow(
			"[conventional-recommended-bump] Unable to determine next version",
		);

		deleteTestDir();
	});

	it("should be able to define the next version using the config", async () => {
		const { createJSONFile, createCommits, createTestConfig, deleteTestDir } =
			createTestDir("version getNextVersion");

		createJSONFile({ version: "1.2.3" });
		createCommits(["feat: A feature commit"]);

		const { config } = await createTestConfig();
		config.nextVersion = "2.0.0";

		const result = await getNextVersion(config, "1.2.3");
		expect(result).toEqual({ version: "2.0.0" });

		deleteTestDir();
	});
});
