import { readFileSync } from "node:fs";

import { createTestDir } from "../../../tests/create-test-directory.js";
import { JSONPackage } from "../json-package.js";

describe("strategies json-package", () => {
	it("should read a package.json file", async () => {
		const { config, logger, createJSONFile } = await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);

		createJSONFile({ version: "1.2.3" }, "package.json");

		const file = fileManager.read("package.json");
		expect(file?.version).toEqual("1.2.3");
	});

	it("should read a deno.jsonc file", async () => {
		const { config, logger, createFile } = await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);
		createFile(
			`{
			    // This is a comment about the version
				"version": "1.2.3", // Another comment about the version
				"lock": true,
			}`,
			"deno.jsonc",
		);
		const file = fileManager.read("deno.jsonc");
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

		fileManager.write(
			{
				name: "package.json",
				path: relativeTo("package.json"),
				version: "1.2.3",
			},
			"4.5.6",
		);

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

		fileManager.write(
			{
				name: "package-lock.json",
				path: relativeTo("package-lock.json"),
				version: "1.2.3",
			},
			"4.5.6",
		);

		const content = JSON.parse(readFileSync(relativeTo("package-lock.json"), "utf8"));
		expect(content.version).toContain("4.5.6");
		expect(content.packages[""].version).toContain("4.5.6");
	});

	it("should write a deno.jsonc file", async () => {
		const { relativeTo, config, logger, createFile } =
			await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);
		createFile(
			`{
			    // This is a comment about the version
				"version": "1.2.3", // Another comment about the version
				"lock": true,
			}`,
			"deno.jsonc",
		);
		fileManager.write(
			{
				name: "deno.jsonc",
				path: relativeTo("deno.jsonc"),
				version: "1.2.3",
			},
			"4.5.6",
		);

		const content = readFileSync(relativeTo("deno.jsonc"), "utf8");
		expect(content).toBe(
			`{
			    // This is a comment about the version
				"version": "4.5.6", // Another comment about the version
				"lock": true,
			}`,
		);
	});

	it("should write output with tabs if input file is using tabs", async () => {
		const { relativeTo, config, logger, createAndCommitFile } =
			await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);

		createAndCommitFile('{\n\t"version": "1.2.3"\n}', "package.json");

		fileManager.write(
			{
				name: "package.json",
				path: relativeTo("package.json"),
				version: "1.2.3",
			},
			"4.5.6",
		);

		const content = readFileSync(relativeTo("package.json"), "utf8");
		expect(content).toBe('{\n\t"version": "4.5.6"\n}');
	});

	it("should match json files", async () => {
		const { config, logger } = await createTestDir("strategies json-package");
		const fileManager = new JSONPackage(config, logger);

		// Supported
		expect(fileManager.isSupportedFile("package.json")).toBe(true);
		expect(fileManager.isSupportedFile("package-lock.json")).toBe(true);
		expect(fileManager.isSupportedFile("deno.jsonc")).toBe(true);

		// Not supported
		expect(fileManager.isSupportedFile("package.json.lock")).toBe(false);
		expect(fileManager.isSupportedFile("package-lock")).toBe(false);
		expect(fileManager.isSupportedFile("package")).toBe(false);
		expect(fileManager.isSupportedFile("package.json.lock")).toBe(false);
	});
});
