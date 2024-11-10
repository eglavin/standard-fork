import { setupTest } from "../../../tests/setup-tests";
import { Git } from "../git";

describe("git", () => {
	it("should accept arguments", async () => {
		const { config, create, execGit } = await setupTest("execute-file");
		const git = new Git(config);

		create.json({ version: "1.0.0" }, "package.json").add();
		execGit.commits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		await expect(execGit.raw("log", "--oneline")).resolves.toContain("test: test arguments works");
	});

	it("should be able to tag commits", async () => {
		const { config, create, execGit } = await setupTest("execute-file");
		const git = new Git(config);

		create.json({ version: "1.0.0" }, "package.json").add();
		execGit.commits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");
		await git.tag("v1.0.0", "-m", "test: test arguments works");

		await expect(execGit.raw("status", "--porcelain")).resolves.toBe("");
	});

	it("should not commit files if dryRun is enabled", async () => {
		const { config, create, execGit } = await setupTest("execute-file");
		config.dryRun = true;
		const git = new Git(config);

		create.json({ version: "1.0.0" }, "package.json").add();
		execGit.commits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");

		await expect(execGit.raw("log", "--oneline")).resolves.not.toContain(
			"test: test arguments works",
		);
	});

	it("should not add files if dryRun is enabled", async () => {
		const { config, create, execGit } = await setupTest("execute-file");
		config.dryRun = true;
		const git = new Git(config);

		create.file("\n", "file.txt");
		execGit.commits();

		await git.add("file.txt");

		await expect(execGit.raw("status", "--porcelain")).resolves.toBe("?? file.txt\n");
	});

	it("should not tag commits if dryRun is enabled", async () => {
		const { config, create, execGit } = await setupTest("execute-file");
		config.dryRun = true;
		const git = new Git(config);

		create.json({ version: "1.0.0" }, "package.json").add();
		execGit.commits();

		await git.commit("--allow-empty", "-m", "test: test arguments works");
		await git.tag("v1.0.0", "-m", "test: test arguments works");

		await expect(execGit.raw("rev-list", "-n", "1", "v1.0.0")).rejects.toThrow(
			/unknown revision or path not in the working tree/,
		);
	});

	it("should log if error is thrown", async () => {
		const { config, create, execGit } = await setupTest("execute-file");
		const git = new Git(config);

		create.json({ version: "1.0.0" }, "package.json").add();
		execGit.commits();

		await expect(async () => await git.add("non-existing-file")).rejects.toThrowError(
			"Command failed: git add non-existing-file\nfatal: pathspec 'non-existing-file' did not match any files",
		);
	});

	it("should be able to get the current branch", async () => {
		const { config, create, execGit } = await setupTest("execute-file");
		const git = new Git(config);

		create.json({ version: "1.0.0" }, "package.json").add();
		execGit.commits();

		const branch = await git.getCurrentBranchName();
		expect(branch).toBe("main");
	});

	it("should check if a file is ignored by git", async () => {
		const { config, create } = await setupTest("execute-file");
		const git = new Git(config);

		create
			.file(
				`
src/*.txt
test/**
`,
				".gitignore",
			)
			.add();

		create.directory("src");
		create.file("", "src", "my-file.txt");
		create.file("", "src", "my-file.js");
		await expect(git.isIgnored("src/my-file.txt")).resolves.toBe(true);
		await expect(git.isIgnored("src/my-file.js")).resolves.toBe(false);

		create.directory("test");
		create.file("", "test", "my-file.txt");
		await expect(git.isIgnored("test/my-file.txt")).resolves.toBe(true);
	});

	it("should be able to get the latest semver tags", async () => {
		const { config, create, execGit } = await setupTest("execute-file");
		const git = new Git(config);

		create.json({ version: "1.0.0" }, "package.json").add();
		execGit.commits();

		const noTags = await git.getLatestTag(config.tagPrefix);
		expect(noTags).toBe("");

		await git.commit("--allow-empty", "-m", "test: a commit");
		await git.tag("v1.0.0", "-m", "chore: release v1.0.0");

		await git.commit("--allow-empty", "-m", "test: another commit");
		await git.tag("v1.0.1", "-m", "chore: release v1.0.1");

		const hasTags = await git.getLatestTag(config.tagPrefix);
		expect(hasTags).toStrictEqual("1.0.1");
	});

	it("should be able to get the latest semver tags with empty tagPrefix", async () => {
		const { config, create, execGit } = await setupTest("execute-file");
		const git = new Git(config);

		create.json({ version: "1.0.0" }, "package.json").add();
		execGit.commits();

		const noTags = await git.getLatestTag("");
		expect(noTags).toBe("");

		await git.commit("--allow-empty", "-m", "test: a commit");
		await git.tag("1.0.0", "-m", "chore: release 1.0.0");

		await git.commit("--allow-empty", "-m", "test: another commit");
		await git.tag("1.0.1", "-m", "chore: release 1.0.1");

		await git.commit("--allow-empty", "-m", "test: another another commit");
		await git.tag("1.0.0-fix.0", "-m", "chore: release 1.0.0-fix.0");

		const hasTags = await git.getLatestTag("");
		expect(hasTags).toStrictEqual("1.0.1");
	});

	it("should only return tags that match the provided tagPrefix", async () => {
		const { config } = await setupTest("execute-file");
		const git = new Git(config);

		await git.commit("--allow-empty", "-m", "test: a commit");
		await git.tag("@fork-version/1.0.0", "-m", "chore: release v1.0.0");

		await git.commit("--allow-empty", "-m", "test: another commit");
		await git.tag("v1.0.1", "-m", "chore: release v1.0.1");

		await git.commit("--allow-empty", "-m", "test: another another commit");
		await git.tag("1.0.2", "-m", "chore: release 1.0.2");

		const vTags = await git.getTags("v");
		expect(vTags).toStrictEqual(["v1.0.1"]);
		expect(vTags).not.toContain("@fork-version/1.0.0");

		await expect(git.getTags("@fork-version/")).resolves.toStrictEqual(["@fork-version/1.0.0"]);

		await expect(git.getTags("non-existing-prefix")).resolves.toStrictEqual([]);
	});

	it("should return tags sorted by most recent commit", async () => {
		const { config } = await setupTest("execute-file");
		const git = new Git(config);

		await git.commit("--allow-empty", "-m", "test: a commit");
		await git.tag("v1.0.0", "-m", "chore: release v1.0.0");

		await git.commit("--allow-empty", "-m", "test: another commit");
		await git.tag("v1.0.1", "-m", "chore: release v1.0.1");

		await git.commit("--allow-empty", "-m", "test: another another commit");
		await git.tag("v1.0.2", "-m", "chore: release v1.0.2");

		await expect(git.getTags("v")).resolves.toStrictEqual(["v1.0.2", "v1.0.1", "v1.0.0"]);
	});
});
