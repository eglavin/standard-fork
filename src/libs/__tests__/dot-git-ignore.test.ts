import { createTestDir } from "../../../tests/create-test-directory";
import { DotGitIgnore } from "../dot-git-ignore";

describe("dot-git-ignore", () => {
	it("should not match if .gitignore does not exist", async () => {
		const { testFolder } = await createTestDir("dot-git-ignore");

		const dotgitignore = new DotGitIgnore(testFolder);

		expect(dotgitignore.shouldIgnore("file.txt")).toBe(false);
		expect(dotgitignore.shouldIgnore("file.js")).toBe(false);
	});

	it("should ignore files", async () => {
		const { testFolder, createFile } = await createTestDir("dot-git-ignore");

		await createFile(
			`
*.txt
`,
			".gitignore",
		);

		const dotgitignore = new DotGitIgnore(testFolder);

		expect(dotgitignore.shouldIgnore("file.txt")).toBe(true);
		expect(dotgitignore.shouldIgnore("file.js")).toBe(false);
	});

	it("should ignore files under a specific path", async () => {
		const { testFolder, createFile } = await createTestDir("dot-git-ignore");

		await createFile(
			`
src/*.txt
test/**
`,
			".gitignore",
		);

		const dotgitignore = new DotGitIgnore(testFolder);

		expect(dotgitignore.shouldIgnore("src/file.txt")).toBe(true);
		expect(dotgitignore.shouldIgnore("src/file.js")).toBe(false);
		expect(dotgitignore.shouldIgnore("test/helpers/utils.js")).toBe(true);
	});

	it("should not ignore commented out lines", async () => {
		const { testFolder, createFile } = await createTestDir("dot-git-ignore");

		await createFile(
			`
#package.json
# package-lock.json
my-proj.csproj
`,
			".gitignore",
		);

		const dotgitignore = new DotGitIgnore(testFolder);

		expect(dotgitignore.shouldIgnore("package.json")).toBe(false);
		expect(dotgitignore.shouldIgnore("package-lock.json")).toBe(false);
		expect(dotgitignore.shouldIgnore("my-proj.csproj")).toBe(true);
	});

	it("should not ignore negated lines", async () => {
		const { testFolder, createFile } = await createTestDir("dot-git-ignore");

		await createFile(
			`
*.txt
!file.txt
`,
			".gitignore",
		);

		const dotgitignore = new DotGitIgnore(testFolder);

		expect(dotgitignore.shouldIgnore("ignored-file.txt")).toBe(true);
		expect(dotgitignore.shouldIgnore("file.txt")).toBe(false);
	});

	it("should ignore all files", async () => {
		const { testFolder, createFile } = await createTestDir("dot-git-ignore");

		await createFile(
			`
*
!.gitignore
`,
			".gitignore",
		);

		const dotgitignore = new DotGitIgnore(testFolder);

		expect(dotgitignore.shouldIgnore("file.txt")).toBe(true);
		expect(dotgitignore.shouldIgnore("file.js")).toBe(true);
	});
});
