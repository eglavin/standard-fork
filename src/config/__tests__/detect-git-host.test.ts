import { setupTest } from "../../../tests/setup-tests";
import { detectGitHost } from "../detect-git-host";

describe("detect-git-host", () => {
	it("should detect a https azure git host", async () => {
		const { execGit, testFolder } = await setupTest("detect-git-host");

		await execGit.raw(
			"remote",
			"add",
			"origin",
			"https://ORGANISATION@dev.azure.com/ORGANISATION/PROJECT/_git/REPOSITORY",
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
		const { execGit, testFolder } = await setupTest("detect-git-host");

		await execGit.raw(
			"remote",
			"add",
			"origin",
			"git@ssh.dev.azure.com:v3/ORGANISATION/PROJECT/REPOSITORY",
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
		const { testFolder } = await setupTest("detect-git-host");

		await expect(detectGitHost(testFolder)).resolves.toBeNull();
	});
});
