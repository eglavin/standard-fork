import { setupTest } from "../../../tests/setup-tests";
import { Git } from "../git";
import { parseRawCommit, type Commit } from "../parse-commit";

describe("parse-commit", () => {
	it("should be able to parse raw commits", () => {
		const commits = [
			"refactor: this is a long commit message with a lot of content in it which I'm wondering how it would be handled by the commit log parsing system so we'll see what happens.\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n5e82c418e5007cc9d53a30e17068f928353ff4db\n2024-12-22T17:36:50Z\nFork Version\nfork-version@example.com\n",
			"refactor: add test file\n\n4ef2c86d393a9660aa9f753144256b1f200c16bd\n2024-12-22T17:36:50Z\nFork Version\nfork-version@example.com\n",
			"refactor: add util file\n\n7e1618e6e5183977dff5d3b21378850b346032c1\n2024-12-22T17:36:50Z\nFork Version\nfork-version@example.com\n",
			"refactor: add lib file\n\n5b0929684cfdf3d3e8652a35d0ed2d1ce29f2833\n2024-12-22T17:36:50Z\nFork Version\nfork-version@example.com\n",
			"feat: initial commit\nBREAKING CHANGE: this is a breaking change\n\n4a79e9e546b4020d2882b7810dc549fa71960f4f\n2024-12-22T17:36:50Z\nFork Version\nfork-version@example.com\n",
		];

		const parsedCommits = commits.map(parseRawCommit);

		expect(parsedCommits[0]).toStrictEqual({
			subject:
				"refactor: this is a long commit message with a lot of content in it which I'm wondering how it would be handled by the commit log parsing system so we'll see what happens.",
			body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			hash: "5e82c418e5007cc9d53a30e17068f928353ff4db",
			date: "2024-12-22T17:36:50Z",
			name: "Fork Version",
			email: "fork-version@example.com",
		} as Commit);

		expect(parsedCommits[1]).toStrictEqual({
			subject: "refactor: add test file",
			body: "",
			hash: "4ef2c86d393a9660aa9f753144256b1f200c16bd",
			date: "2024-12-22T17:36:50Z",
			name: "Fork Version",
			email: "fork-version@example.com",
		} as Commit);

		expect(parsedCommits[2]).toStrictEqual({
			subject: "refactor: add util file",
			body: "",
			hash: "7e1618e6e5183977dff5d3b21378850b346032c1",
			date: "2024-12-22T17:36:50Z",
			name: "Fork Version",
			email: "fork-version@example.com",
		} as Commit);

		expect(parsedCommits[3]).toStrictEqual({
			subject: "refactor: add lib file",
			body: "",
			hash: "5b0929684cfdf3d3e8652a35d0ed2d1ce29f2833",
			date: "2024-12-22T17:36:50Z",
			name: "Fork Version",
			email: "fork-version@example.com",
		} as Commit);

		expect(parsedCommits[4]).toStrictEqual({
			subject: "feat: initial commit",
			body: "BREAKING CHANGE: this is a breaking change",
			hash: "4a79e9e546b4020d2882b7810dc549fa71960f4f",
			date: "2024-12-22T17:36:50Z",
			name: "Fork Version",
			email: "fork-version@example.com",
		} as Commit);
	});

	it("should be able to interface with the getCommand method from the git class", async () => {
		const { config } = await setupTest("parse-commit");
		const git = new Git(config);

		await git.commit(
			"--allow-empty",
			"-m",
			"feat: initial commit",
			"-m",
			"BREAKING CHANGE: this is a breaking change",
		);

		await git.commit(
			"--allow-empty",
			"-m",
			`refactor: this is a long commit message with a lot of content in it
which I'm wondering how it would be handled by the commit log parsing
system so we'll see what happens.`,
			"-m",
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
		);

		const commits = await git.getCommits();

		const parsedCommits = commits.map(parseRawCommit);

		expect(parsedCommits[0]).toStrictEqual({
			subject:
				"refactor: this is a long commit message with a lot of content in it which I'm wondering how it would be handled by the commit log parsing system so we'll see what happens.",
			body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			hash: expect.any(String),
			date: expect.any(String),
			name: "Fork Version",
			email: "fork-version@example.com",
		} as Commit);

		expect(parsedCommits[1]).toStrictEqual({
			subject: "feat: initial commit",
			body: "BREAKING CHANGE: this is a breaking change",
			hash: expect.any(String),
			date: expect.any(String),
			name: "Fork Version",
			email: "fork-version@example.com",
		} as Commit);
	});

	it("should return null if the commit is not in the correct format", () => {
		const subject = "refactor: add test file";
		const body = "\r\n\n";
		const hash = "4ef2c86d393a9660aa9f753144256b1f200c16bd";
		const date = "2024-12-22T17:36:50Z";
		const name = "Fork Version";
		const email = "fork-version@example.com";

		// should parse correctly
		expect(parseRawCommit([subject, body, hash, date, name, email, ""].join("\n"))).toStrictEqual({
			subject,
			body: "", // Extra whitespace should be removed
			hash,
			date,
			name,
			email,
		} as Commit);

		// should return null
		expect(
			() => parseRawCommit([subject, body, hash, name, email, date, ""].join("\n")), // date and email are swapped
		).toThrowError("Invalid commit format");
		expect(
			() => parseRawCommit([subject, body, hash, date, name, email, "extra line"].join("\n")), // unknown extra content
		).toThrowError("Invalid commit format");
		expect(
			() => parseRawCommit([subject, body, hash, date, name].join("\n")), // missing data
		).toThrowError("Invalid commit format");
	});
});
