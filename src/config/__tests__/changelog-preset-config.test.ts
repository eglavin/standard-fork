import { getChangelogPresetConfig } from "../changelog-preset-config";

describe("changelog-preset-config", () => {
	it("should return the default config", () => {
		const config = getChangelogPresetConfig({}, {} as never);

		expect(config).toMatchObject({
			commitUrlFormat: "{{host}}/{{owner}}/{{repository}}/commit/{{hash}}",
			compareUrlFormat:
				"{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}",
			header: `# Changelog

`,
			issuePrefixes: ["#"],
			issueUrlFormat: "{{host}}/{{owner}}/{{repository}}/issues/{{id}}",
			name: "conventionalcommits",
			preMajor: false,
			releaseCommitMessageFormat: "chore(release): {{currentTag}}",
			types: [
				{
					section: "Features",
					type: "feat",
				},
				{
					section: "Bug Fixes",
					type: "fix",
				},
				{
					hidden: true,
					type: "chore",
				},
				{
					hidden: true,
					type: "docs",
				},
				{
					hidden: true,
					type: "style",
				},
				{
					hidden: true,
					type: "refactor",
				},
				{
					hidden: true,
					type: "perf",
				},
				{
					hidden: true,
					type: "test",
				},
			],
			userUrlFormat: "{{host}}/{{user}}",
		});
	});

	it("user should be able to override default settings", () => {
		const config = getChangelogPresetConfig(
			{
				changelogPresetConfig: {
					commitUrlFormat: "{{host}}/fork-version/commit/{{hash}}",
					compareUrlFormat:
						"{{host}}/fork-version/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}}",
					releaseCommitMessageFormat: "chore(release): {{currentTag}} [skip ci]",
					types: [
						{ type: "feat", section: "New Features" },
						{ type: "fix", section: "Bug Fixes" },
					],
				},
			},
			{} as never,
		);

		expect(config).toMatchObject({
			commitUrlFormat: "{{host}}/fork-version/commit/{{hash}}",
			compareUrlFormat:
				"{{host}}/fork-version/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}}",
			header: `# Changelog

`,
			issuePrefixes: ["#"],
			issueUrlFormat: "{{host}}/{{owner}}/{{repository}}/issues/{{id}}",
			name: "conventionalcommits",
			preMajor: false,
			releaseCommitMessageFormat: "chore(release): {{currentTag}} [skip ci]",
			types: [
				{
					section: "New Features",
					type: "feat",
				},
				{
					section: "Bug Fixes",
					type: "fix",
				},
			],
			userUrlFormat: "{{host}}/{{user}}",
		});
	});

	it("should be able to override from CLI arguments", () => {
		const config = getChangelogPresetConfig({}, {
			commitUrlFormat: "{{host}}/fork-version/commit/{{hash}}",
			compareUrlFormat:
				"{{host}}/fork-version/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}}",
			issueUrlFormat: "{{host}}/fork-version/issues/{{id}}",
			userUrlFormat: "{{host}}/fork-version/user/{{user}}",
			releaseCommitMessageFormat: "chore(release): {{currentTag}} [skip ci]",
		} as never);

		expect(config.commitUrlFormat).toBe("{{host}}/fork-version/commit/{{hash}}");
		expect(config.compareUrlFormat).toBe(
			"{{host}}/fork-version/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}}",
		);
		expect(config.issueUrlFormat).toBe("{{host}}/fork-version/issues/{{id}}");
		expect(config.userUrlFormat).toBe("{{host}}/fork-version/user/{{user}}");
		expect(config.releaseCommitMessageFormat).toBe("chore(release): {{currentTag}} [skip ci]");
	});

	it("should be able to append a releaseMessageSuffix to the releaseCommitMessageFormat", () => {
		const config = getChangelogPresetConfig(
			{
				releaseMessageSuffix: "[skip ci]",
			},
			{} as never,
		);

		expect(config.releaseCommitMessageFormat).toBe("chore(release): {{currentTag}} [skip ci]");
	});

	it("should be able to append a releaseMessageSuffix to the releaseCommitMessageFormat from CLI arguments", () => {
		const config = getChangelogPresetConfig({}, {
			releaseMessageSuffix: "[no ci]",
		} as never);

		expect(config.releaseCommitMessageFormat).toBe("chore(release): {{currentTag}} [no ci]");
	});
});
