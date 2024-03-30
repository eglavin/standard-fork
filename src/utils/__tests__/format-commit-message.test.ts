import { describe, expect, it } from "vitest";

import { formatCommitMessage } from "../format-commit-message";

describe("format-commit-message", () => {
	it("should return message with the version replaced", () => {
		expect(formatCommitMessage("chore(release): {{currentTag}}", "1.2.3")).toBe(
			"chore(release): 1.2.3",
		);

		expect(formatCommitMessage("chore(release): {{currentTag}} [skip ci]", "1.2.3")).toBe(
			"chore(release): 1.2.3 [skip ci]",
		);

		expect(formatCommitMessage("{{currentTag}}", "1.2.3")).toBe("1.2.3");
	});

	it("should return default message if argument is falsy", () => {
		expect(formatCommitMessage(undefined, "1.2.3")).toBe("chore(release): 1.2.3");
	});
});
