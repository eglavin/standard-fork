import { join } from "node:path";
import { readFileSync } from "node:fs";

import { createTestDir } from "../../../tests/create-test-directory";
import { JSONPackage } from "../json-package";

describe("strategies json-package", () => {
	it("should read a package.json file", async () => {
		const { createJSONFile, createTestConfig } = createTestDir("strategies json-package");

		createJSONFile({ version: "1.2.3" }, "package.json");

		const { config, logger } = await createTestConfig();
		const fileManager = new JSONPackage(config, logger);

		const file = fileManager.read("package.json");
		expect(file?.version).toEqual("1.2.3");
	});

	it("should log a message if unable to read version", async () => {
		const { createJSONFile, createTestConfig } = createTestDir("strategies json-package");

		createJSONFile({ version: "" }, "package.json");

		const { config, logger } = await createTestConfig();
		const fileManager = new JSONPackage(config, logger);

		const file = fileManager.read("package.json");
		expect(file).toBeUndefined();

		expect(logger.warn).toBeCalledWith("Unable to determine json package file: package.json");
	});

	it("should read private property", async () => {
		const { createJSONFile, createTestConfig } = createTestDir("strategies json-package");

		createJSONFile({ version: "1.2.3", private: true }, "package.json");

		const { config, logger } = await createTestConfig();
		const fileManager = new JSONPackage(config, logger);

		const file = fileManager.read("package.json");
		expect(file?.isPrivate).toEqual(true);
	});

	it("should write a package.json file", async () => {
		const { testDir, createJSONFile, createTestConfig } = createTestDir("strategies json-package");

		createJSONFile({ version: "1.2.3" }, "package.json");

		const { config, logger } = await createTestConfig();
		const fileManager = new JSONPackage(config, logger);

		fileManager.write(join(testDir, "package.json"), "4.5.6");

		const file = fileManager.read(join(testDir, "package.json"));
		expect(file?.version).toEqual("4.5.6");
	});

	it("should write a package-lock.json file", async () => {
		const { testDir, createJSONFile, createTestConfig } = createTestDir("strategies json-package");

		createJSONFile(
			{
				version: "1.2.3",
				lockfileVersion: 2,
				packages: { "": { version: "1.2.3" } },
			},
			"package-lock.json",
		);

		const { config, logger } = await createTestConfig();
		const fileManager = new JSONPackage(config, logger);

		fileManager.write(join(testDir, "package-lock.json"), "4.5.6");

		const content = JSON.parse(readFileSync(join(testDir, "package-lock.json"), "utf8"));
		expect(content.version).toContain("4.5.6");
		expect(content.packages[""].version).toContain("4.5.6");
	});
});
