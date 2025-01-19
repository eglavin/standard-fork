import { recommendedBump } from "../recommended-bump";

describe("recommended-bump", () => {
	it("should recommend a major bump", () => {
		const commits = [
			{
				breakingChange: true,
				notes: [],
				type: "feat",
			},
		];

		const result = recommendedBump(commits as never);
		expect(result.releaseType).toBe("major");
	});

	it("should recommend a minor bump", () => {
		const commits = [
			{
				breakingChange: false,
				notes: [],
				type: "feat",
			},
		];

		const result = recommendedBump(commits as never);
		expect(result.releaseType).toBe("minor");
	});

	it("should recommend a patch bump", () => {
		const commits = [
			{
				breakingChange: false,
				notes: [],
				type: "fix",
			},
		];

		const result = recommendedBump(commits as never);
		expect(result.releaseType).toBe("patch");
	});

	it("should recommend a major bump with notes", () => {
		const commits = [
			{
				breakingChange: false,
				notes: [
					{
						title: "BREAKING CHANGE",
						text: "",
					},
				],
				type: "feat",
			},
		];

		const result = recommendedBump(commits as never);
		expect(result.releaseType).toBe("major");
	});

	it("should handle a pre-major patch bump", () => {
		const commits = [
			{
				breakingChange: false,
				notes: [],
				type: "fix",
			},
			{
				breakingChange: false,
				notes: [],
				type: "feat",
			},
		];

		const result = recommendedBump(commits as never, true);
		expect(result.releaseType).toBe("patch");
	});

	it("should handle a pre-major minor bump", () => {
		const commits = [
			{
				breakingChange: false,
				notes: [],
				type: "fix",
			},
			{
				breakingChange: true,
				notes: [],
				type: "feat",
			},
		];

		const result = recommendedBump(commits as never, true);
		expect(result.releaseType).toBe("minor");
	});

	it("should handle a pre-major notes bump", () => {
		const commits = [
			{
				breakingChange: false,
				notes: [],
				type: "fix",
			},
			{
				breakingChange: false,
				notes: [
					{
						title: "BREAKING CHANGE",
						text: "",
					},
				],
				type: "feat",
			},
		];

		const result = recommendedBump(commits as never, true);
		expect(result.releaseType).toBe("minor");
	});
});
