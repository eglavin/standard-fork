import { defineConfig } from "../define-config";

describe("define-config", () => {
	it("should return the given config", () => {
		const TEST_CONFIG = {
			changelog: "MY_CHANGELOG.md",
		};

		expect(defineConfig(TEST_CONFIG)).toStrictEqual(TEST_CONFIG);
	});
});
