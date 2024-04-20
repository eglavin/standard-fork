import { readFileSync } from "node:fs";

import { createTestDir } from "../../../tests/create-test-directory";
import { JSONPackage } from "../json-package";

describe("strategies json-package", () => {
	it("should read a package.json file", async () => {
		const { config, logger, createJSONFile } = await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);

		createJSONFile({ version: "1.2.3" }, "package.json");

		const file = fileManager.read("package.json");
		expect(file?.version).toEqual("1.2.3");
	});

	it("should log a message if unable to read version", async () => {
		const { config, logger, createJSONFile } = await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);

		createJSONFile({ version: "" }, "package.json");

		const file = fileManager.read("package.json");
		expect(file).toBeUndefined();
		expect(logger.warn).toBeCalledWith(
			"[File Manager] Unable to determine json package: package.json",
		);
	});

	it("should read private property", async () => {
		const { config, logger, createJSONFile } = await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);

		createJSONFile({ version: "1.2.3", private: true }, "package.json");

		const file = fileManager.read("package.json");
		expect(file?.isPrivate).toEqual(true);
	});

	it("should write a package.json file", async () => {
		const { relativeTo, config, logger, createJSONFile } =
			await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);

		createJSONFile({ version: "1.2.3" }, "package.json");

		fileManager.write(relativeTo("package.json"), "4.5.6");

		const file = fileManager.read(relativeTo("package.json"));
		expect(file?.version).toEqual("4.5.6");
	});

	it("should write a package-lock.json file", async () => {
		const { relativeTo, config, logger, createJSONFile } =
			await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);

		createJSONFile(
			{
				version: "1.2.3",
				lockfileVersion: 2,
				packages: { "": { version: "1.2.3" } },
			},
			"package-lock.json",
		);

		fileManager.write(relativeTo("package-lock.json"), "4.5.6");

		const content = JSON.parse(readFileSync(relativeTo("package-lock.json"), "utf8"));
		expect(content.version).toContain("4.5.6");
		expect(content.packages[""].version).toContain("4.5.6");
	});
});
