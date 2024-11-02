import { defineConfig } from "../user-config.js";

describe("user-config", () => {
	it("should return the given config", () => {
		const config = defineConfig({ changelog: "MY_CHANGELOG.md" });

		expect(config.changelog).toBe("MY_CHANGELOG.md");
	});
});
