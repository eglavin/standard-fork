import { join } from "node:path";
import { readFileSync } from "node:fs";

import { createTestDir } from "../../../tests/create-test-directory";
import { PlainText } from "../plain-text";

describe("strategies plain-text", () => {
	it("should be able to read version from version.txt file", async () => {
		const { createFile, createTestConfig } = createTestDir("strategies plain-text");

		createFile("1.2.3", "version.txt");

		const { config, logger } = await createTestConfig();
		const fileManager = new PlainText(config, logger);

		const file = fileManager.read("version.txt");

		expect(file?.version).toEqual("1.2.3");
	});

	it('should log a warning when "version.txt" file is not found', async () => {
		const { createTestConfig } = createTestDir("strategies plain-text");

		const { config, logger } = await createTestConfig();
		const fileManager = new PlainText(config, logger);

		const file = fileManager.read("version.txt");

		expect(file).toBeUndefined();
		expect(logger.warn).toHaveBeenCalledWith(
			"[File Manager] Unable to determine plain text: version.txt",
		);
	});

	it("should return empty string when version.txt is empty", async () => {
		const { testDir, createFile, createTestConfig } = createTestDir("strategies plain-text");

		createFile("", "version.txt");

		const { config, logger } = await createTestConfig();
		const fileManager = new PlainText(config, logger);

		const file = fileManager.read(join(testDir, "version.txt"));

		expect(file?.version).toEqual("");
	});

	it("should be able to write version to version.txt file", async () => {
		const { testDir, createFile, createTestConfig } = createTestDir("strategies plain-text");

		createFile("1.2.3", "version.txt");

		const { config, logger } = await createTestConfig();
		const fileManager = new PlainText(config, logger);

		fileManager.write(join(testDir, "version.txt"), "1.2.4");

		const newVersion = readFileSync(join(testDir, "version.txt"), "utf-8");

		expect(newVersion).toEqual("1.2.4");
	});
});
