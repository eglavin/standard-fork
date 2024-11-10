import { setupTest } from "../../../tests/setup-tests";
import { getCurrentVersion, getNextVersion } from "../version";
import { FileManager } from "../../files/file-manager";

describe("version > getCurrentVersion", () => {
	it("should be able to read package.json", async () => {
		const { config, create, execGit, git, logger, relativeTo } = await setupTest(
			"version getCurrentVersion",
		);
		const fileManager = new FileManager(config, logger);

		create.json({ version: "1.2.3" }, "package.json").add();
		execGit.commits();

		const result = await getCurrentVersion(config, logger, git, fileManager, config.files);
		expect(result).toStrictEqual({
			files: [
				{
					name: "package.json",
					path: relativeTo("package.json"),
					version: "1.2.3",
					isPrivate: true,
				},
			],
			version: "1.2.3",
		});
	});

	it("should determine the package is private", async () => {
		const { config, create, execGit, git, logger, relativeTo } = await setupTest(
			"version getCurrentVersion",
		);
		const fileManager = new FileManager(config, logger);

		create.json({ version: "1.2.3", private: true }, "package.json").add();
		execGit.commits();

		const result = await getCurrentVersion(config, logger, git, fileManager, config.files);
		expect(result).toStrictEqual({
			files: [
				{
					name: "package.json",
					path: relativeTo("package.json"),
					version: "1.2.3",
					isPrivate: true,
				},
			],
			version: "1.2.3",
		});
	});

	it("should be able to read package-lock.json", async () => {
		const { config, create, execGit, git, logger, relativeTo } = await setupTest(
			"version getCurrentVersion",
		);
		const fileManager = new FileManager(config, logger);

		create.json({ version: "1.2.3" }, "package.json").add();
		create
			.json(
				{
					version: "1.2.3",
					lockfileVersion: 2,
					packages: { "": { version: "1.2.3" } },
				},
				"package-lock.json",
			)
			.add();
		execGit.commits();

		const result = await getCurrentVersion(config, logger, git, fileManager, config.files);
		expect(result).toStrictEqual({
			files: [
				{
					name: "package.json",
					path: relativeTo("package.json"),
					version: "1.2.3",
					isPrivate: true,
				},
				{
					name: "package-lock.json",
					path: relativeTo("package-lock.json"),
					version: "1.2.3",
					isPrivate: true,
				},
			],
			version: "1.2.3",
		});
	});

	it("should fallback and get the latest tag from git", async () => {
		const { config, git, logger } = await setupTest("version getCurrentVersion");
		const fileManager = new FileManager(config, logger);

		await git.commit("--allow-empty", "-m", "test: a commit");
		await git.tag("v1.2.3", "-m", "chore: release 1.2.3");

		await expect(getCurrentVersion(config, logger, git, fileManager, config.files)).rejects.toThrow(
			"Unable to find current version",
		);

		config.gitTagFallback = true;

		const taggedResult = await getCurrentVersion(config, logger, git, fileManager, config.files);
		expect(taggedResult).toStrictEqual({
			files: [],
			version: "1.2.3",
		});
	});

	it("should throw an error if multiple versions found and not allowing multiple versions", async () => {
		const { config, create, execGit, git, logger } = await setupTest("version getCurrentVersion");
		const fileManager = new FileManager(config, logger);
		config.allowMultipleVersions = false;

		create.json({ version: "1.2.3" }, "package.json").add();
		create.json({ version: "3.2.1" }, "package-lock.json").add();
		execGit.commits();

		await expect(getCurrentVersion(config, logger, git, fileManager, config.files)).rejects.toThrow(
			"Found multiple versions",
		);
	});

	it("should throw an error if no version found", async () => {
		const { config, git, logger } = await setupTest("getCurrentVersion");
		const fileManager = new FileManager(config, logger);

		await expect(getCurrentVersion(config, logger, git, fileManager, config.files)).rejects.toThrow(
			"Unable to find current version",
		);
	});

	it("should take the latest version if multiple found", async () => {
		const { config, create, execGit, git, logger } = await setupTest("getCurrentVersion");
		const fileManager = new FileManager(config, logger);

		create.json({ version: "1.2.3" }, "package.json").add();
		create.json({ version: "3.2.1" }, "package-lock.json").add();
		execGit.commits();

		const result = await getCurrentVersion(config, logger, git, fileManager, config.files);
		expect(result.files.map((f) => f.version)).toStrictEqual(["1.2.3", "3.2.1"]);
		expect(result.version).toStrictEqual("3.2.1");
	});

	it("should be able to define the current version using the config", async () => {
		const { config, create, execGit, git, logger, relativeTo } = await setupTest(
			"version getCurrentVersion",
		);
		config.currentVersion = "3.2.1";
		const fileManager = new FileManager(config, logger);

		create.json({ version: "1.2.3" }, "package.json").add();
		execGit.commits();

		const result = await getCurrentVersion(config, logger, git, fileManager, config.files);
		expect(result).toStrictEqual({
			files: [
				{
					name: "package.json",
					path: relativeTo("package.json"),
					version: "1.2.3",
					isPrivate: true,
				},
			],
			version: "3.2.1",
		});
	});

	it("should log the version and exit if inspectVersion set", async () => {
		const spyOnConsole = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const spyOnProcess = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

		const { config, create, execGit, git, logger } = await setupTest("version getCurrentVersion");
		config.inspectVersion = true;
		const fileManager = new FileManager(config, logger);

		create.json({ version: "1.2.3" }, "package.json").add();
		execGit.commits();

		await getCurrentVersion(config, logger, git, fileManager, config.files);
		expect(spyOnConsole).toHaveBeenCalledWith("1.2.3");
		expect(spyOnProcess).toHaveBeenCalledWith(0);

		spyOnConsole.mockRestore();
		spyOnProcess.mockRestore();
	});
});

describe("version > getNextVersion", () => {
	it("should determine the next version as a minor bump", async () => {
		const { config, create, execGit, logger } = await setupTest("version getNextVersion");

		create.json({ version: "1.2.3" }, "package.json").add();
		execGit.commit("feat: A feature commit");

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({
			level: 1,
			preMajor: false,
			reason: "There are 0 BREAKING CHANGES and 1 features",
			releaseType: "minor",
			version: "1.3.0",
		});
	});

	it("should throw an error if not able to determine the next version", async () => {
		const { config, logger } = await setupTest("version getNextVersion");

		await expect(getNextVersion(config, logger, "1.2.3")).rejects.toThrow(
			"[conventional-recommended-bump] Unable to determine next version",
		);
	});

	it("should be able to define the next version using the config", async () => {
		const { config, create, execGit, logger } = await setupTest("version getNextVersion");
		config.nextVersion = "2.0.0";

		create.json({ version: "1.2.3" }, "package.json").add();
		execGit.commit("feat: A feature commit");

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({ version: "2.0.0" });
	});

	it("should skip version bump", async () => {
		const { config, logger } = await setupTest("version getNextVersion");
		config.skipBump = true;

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({ version: "1.2.3" });
	});

	it("should recommend a pre-major bump", async () => {
		const { config, execGit, logger } = await setupTest("version getNextVersion");

		execGit.commit("feat: A feature commit");

		const result = await getNextVersion(config, logger, "0.1.0");
		expect(result).toStrictEqual({
			level: 2,
			preMajor: true,
			reason: "There are 0 BREAKING CHANGES and 0 features",
			releaseType: "patch",
			version: "0.1.1",
		});
	});

	it("should recommend a patch bump", async () => {
		const { config, execGit, logger } = await setupTest("version getNextVersion");

		execGit.commit("fix: A fix commit");

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({
			level: 2,
			preMajor: false,
			reason: "There are 0 BREAKING CHANGES and 0 features",
			releaseType: "patch",
			version: "1.2.4",
		});
	});

	it("should recommend a minor bump", async () => {
		const { config, create, execGit, logger } = await setupTest("version getNextVersion");

		create.file("TEST_CONTENT", "CHANGELOG.md").add();
		execGit.commit("feat: A feature commit");

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({
			level: 1,
			preMajor: false,
			reason: "There are 0 BREAKING CHANGES and 1 features",
			releaseType: "minor",
			version: "1.3.0",
		});
	});

	it("should recommend a major bump", async () => {
		const { config, create, execGit, logger } = await setupTest("version getNextVersion");

		create.file("TEST_CONTENT", "CHANGELOG.md").add();
		execGit.commit("feat!: A feature commit");

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({
			level: 0,
			preMajor: false,
			reason: "There is 1 BREAKING CHANGE and 0 features",
			releaseType: "major",
			version: "2.0.0",
		});
	});

	it('should be able to set "releaseAs" as a major bump', async () => {
		const { config, logger } = await setupTest("version getNextVersion");
		config.releaseAs = "major";

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({
			level: -1,
			preMajor: false,
			reason: "User defined",
			releaseType: "major",
			version: "2.0.0",
		});
	});

	it('should be able to set "releaseAs" as a minor bump', async () => {
		const { config, logger } = await setupTest("version getNextVersion");
		config.releaseAs = "minor";

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({
			level: -1,
			preMajor: false,
			reason: "User defined",
			releaseType: "minor",
			version: "1.3.0",
		});
	});

	it('should be able to set "releaseAs" as a patch bump', async () => {
		const { config, logger } = await setupTest("version getNextVersion");
		config.releaseAs = "patch";

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({
			level: -1,
			preMajor: false,
			reason: "User defined",
			releaseType: "patch",
			version: "1.2.4",
		});
	});

	it('should be able to set "releaseAs" and "preRelease" to create an alpha release', async () => {
		const { config, logger } = await setupTest("version getNextVersion");
		config.releaseAs = "major";
		config.preRelease = "alpha";

		const result = await getNextVersion(config, logger, "1.2.3");
		expect(result).toStrictEqual({
			level: -1,
			preMajor: false,
			reason: "User defined",
			releaseType: "premajor",
			version: "2.0.0-alpha.0",
		});

		const result2 = await getNextVersion(config, logger, "2.0.0-alpha.0");
		expect(result2).toStrictEqual({
			level: -1,
			preMajor: false,
			reason: "User defined",
			releaseType: "prerelease",
			version: "2.0.0-alpha.1",
		});
	});
});
