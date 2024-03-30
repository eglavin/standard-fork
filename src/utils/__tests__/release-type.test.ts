import { describe, expect, it } from "vitest";

import { getReleaseType } from "../release-type";

describe("release-type", () => {
	it("should return the given release type when no tag given", () => {
		expect(getReleaseType("patch", "1.0.0", false)).toBe("patch");
	});

	it("should prefix pre when requesting a new pre release", () => {
		expect(getReleaseType("major", "1.2.3", true)).toBe("premajor");
		expect(getReleaseType("minor", "1.2.3", true)).toBe("preminor");
		expect(getReleaseType("patch", "1.2.3", true)).toBe("prepatch");
		expect(getReleaseType("unknown" as never, "1.2.3", true)).toBe("preunknown");
	});

	it("should return prex when release type is greater then the current version", () => {
		expect(getReleaseType("major", "0.0.0-beta", "beta")).toBe("premajor");
		expect(getReleaseType("minor", "0.0.0-beta", "beta")).toBe("preminor");
		expect(getReleaseType("patch", "0.0.0-beta", "beta")).toBe("prepatch");
	});

	it("should return prerelease when current version is equal or greater than release type", () => {
		expect(getReleaseType("major", "1.2.3-charlie", "charlie")).toBe("prerelease");
		expect(getReleaseType("minor", "0.1.2-charlie", "charlie")).toBe("prerelease");
		expect(getReleaseType("minor", "1.2.3-charlie", "charlie")).toBe("prerelease");
		expect(getReleaseType("patch", "0.0.1-charlie", "charlie")).toBe("prerelease");
		expect(getReleaseType("patch", "0.1.2-charlie", "charlie")).toBe("prerelease");
		expect(getReleaseType("patch", "1.2.3-charlie", "charlie")).toBe("prerelease");
	});
});
