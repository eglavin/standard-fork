import { execFileSync } from "child_process";
import { createTestDir } from "../../../tests/create-test-directory.js";
import { detectGitHost } from "../detect-git-host.js";

describe("detect-git-host", () => {
	it("should detect a https azure git host", async () => {
		const { testFolder } = await createTestDir("detect-git-host");

		execFileSync(
			"git",
			[
				"remote",
				"add",
				"origin",
				"https://ORGANISATION@dev.azure.com/ORGANISATION/PROJECT/_git/REPOSITORY",
			],
			{ cwd: testFolder },
		);

		const gitHost = await detectGitHost(testFolder);

		expect(gitHost?.detectedGitHost).toBe("Azure");
		expect(gitHost?.commitUrlFormat).toBe(
			"{{host}}/ORGANISATION/PROJECT/_git/REPOSITORY/commit/{{hash}}",
		);
		expect(gitHost?.compareUrlFormat).toBe(
			"{{host}}/ORGANISATION/PROJECT/_git/REPOSITORY/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}}",
		);
		expect(gitHost?.issueUrlFormat).toBe("{{host}}/ORGANISATION/PROJECT/_workitems/edit/{{id}}");
	});

	it("should detect a ssh azure git host", async () => {
		const { testFolder } = await createTestDir("detect-git-host");

		execFileSync(
			"git",
			["remote", "add", "origin", "git@ssh.dev.azure.com:v3/ORGANISATION/PROJECT/REPOSITORY"],
			{ cwd: testFolder },
		);

		const gitHost = await detectGitHost(testFolder);

		expect(gitHost?.detectedGitHost).toBe("Azure");
		expect(gitHost?.commitUrlFormat).toBe(
			"{{host}}/ORGANISATION/PROJECT/_git/REPOSITORY/commit/{{hash}}",
		);
		expect(gitHost?.compareUrlFormat).toBe(
			"{{host}}/ORGANISATION/PROJECT/_git/REPOSITORY/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}}",
		);
		expect(gitHost?.issueUrlFormat).toBe("{{host}}/ORGANISATION/PROJECT/_workitems/edit/{{id}}");
	});

	it("should not throw when no remote defined", async () => {
		const { testFolder } = await createTestDir("detect-git-host");

		expect(await detectGitHost(testFolder)).toBe(null);
	});
});
