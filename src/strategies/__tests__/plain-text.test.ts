import { readFileSync } from "node:fs";

import { createTestDir } from "../../../tests/create-test-directory.js";
import { PlainText } from "../plain-text.js";

describe("strategies plain-text", () => {
	it("should be able to read version from version.txt file", async () => {
		const { config, logger, createAndCommitFile } = await createTestDir("strategies plain-text");
		const fileManager = new PlainText(config, logger);

		createAndCommitFile("1.2.3", "version.txt");

		const file = fileManager.read("version.txt");

		expect(file?.version).toEqual("1.2.3");
	});

	it('should log a warning when "version.txt" file is not found', async () => {
		const { config, logger } = await createTestDir("strategies plain-text");
		const fileManager = new PlainText(config, logger);

		const file = fileManager.read("version.txt");

		expect(file).toBeUndefined();
		expect(logger.warn).toHaveBeenCalledWith(
			"[File Manager] Unable to determine plain text: version.txt",
		);
	});

	it("should return empty string when version.txt is empty", async () => {
		const { relativeTo, config, logger, createAndCommitFile } =
			await createTestDir("strategies plain-text");
		const fileManager = new PlainText(config, logger);

		createAndCommitFile("", "version.txt");

		const file = fileManager.read(relativeTo("version.txt"));

		expect(file?.version).toEqual("");
	});

	it("should be able to write version to version.txt file", async () => {
		const { relativeTo, config, logger, createAndCommitFile } =
			await createTestDir("strategies plain-text");
		const fileManager = new PlainText(config, logger);

		createAndCommitFile("1.2.3", "version.txt");

		fileManager.write(
			{
				name: "version.txt",
				path: relativeTo("version.txt"),
				version: "1.2.3",
			},
			"1.2.4",
		);
		const newVersion = readFileSync(relativeTo("version.txt"), "utf-8");

		expect(newVersion).toEqual("1.2.4");
	});

	it('should match "version.txt" file name', async () => {
		const { config, logger } = await createTestDir("strategies plain-text");
		const fileManager = new PlainText(config, logger);

		// Supported
		expect(fileManager.isSupportedFile("version.txt")).toBe(true);

		// Not supported
		expect(fileManager.isSupportedFile("version.md")).toBe(false);
	});
});
