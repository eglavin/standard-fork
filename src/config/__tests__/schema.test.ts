import { defineConfig } from "../schema";

describe("schema", () => {
	it("should return the given config", () => {
		const config = defineConfig({ changelog: "MY_CHANGELOG.md" });

		expect(config.changelog).toBe("MY_CHANGELOG.md");
	});
});
