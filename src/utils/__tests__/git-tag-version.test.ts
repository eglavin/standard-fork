import { getLatestGitTagVersion } from "../git-tag-version.js";

// Need to mock the "git-semver-tags" package as testing it will
// run git commands within the fork-version repository which will
// be inconsistent.

const mockGitSemverTags = vi.hoisted(() => vi.fn());
vi.mock("git-semver-tags", async (importOriginal) => {
	return {
		...(await importOriginal<typeof import("git-semver-tags")>()),
		default: mockGitSemverTags,
	};
});

describe("git-tag-version", () => {
	afterEach(() => {
		mockGitSemverTags.mockReset();
	});

	it("should return the latest git tag", () => {
		mockGitSemverTags.mockResolvedValue(["v1.0.0", "v1.0.1", "v1.0.2"]);

		expect(getLatestGitTagVersion("v")).resolves.toBe("1.0.2");
	});

	it("should return an empty string if no tags are found", () => {
		mockGitSemverTags.mockResolvedValue([]);

		expect(getLatestGitTagVersion("v")).resolves.toBe("");
	});
});
