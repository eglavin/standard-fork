import { join } from "node:path";
import { readFileSync } from "node:fs";

import { createTestDir } from "../../../tests/create-test-directory";
import { PlainText } from "../plain-text";

describe("strategies plain-text", () => {
	it("should be able to read version from version.txt file", async () => {
		const { deleteTestDir, createFile, createTestConfig } = createTestDir("strategies plain-text");

		createFile("1.2.3", "version.txt");

		const { config, logger } = await createTestConfig();
		const fileManager = new PlainText(config, logger);

		const file = fileManager.read("version.txt");

		expect(file?.version).toEqual("1.2.3");

		deleteTestDir();
	});

	it('should log a warning when "version.txt" file is not found', async () => {
		const { deleteTestDir, createTestConfig } = createTestDir("strategies plain-text");

		const { config, logger } = await createTestConfig();
		const fileManager = new PlainText(config, logger);

		const file = fileManager.read("version.txt");

		expect(file).toBeUndefined();
		expect(logger.warn).toHaveBeenCalledWith("Unable to determine plain text file: version.txt");

		deleteTestDir();
	});

	it("should return empty string when version.txt is empty", async () => {
		const { testDir, deleteTestDir, createFile, createTestConfig } =
			createTestDir("strategies plain-text");

		createFile("", "version.txt");

		const { config, logger } = await createTestConfig();
		const fileManager = new PlainText(config, logger);

		const file = fileManager.read(join(testDir, "version.txt"));

		expect(file?.version).toEqual("");

		deleteTestDir();
	});

	it("should be able to write version to version.txt file", async () => {
		const { testDir, deleteTestDir, createFile, createTestConfig } =
			createTestDir("strategies plain-text");

		createFile("1.2.3", "version.txt");

		const { config, logger } = await createTestConfig();
		const fileManager = new PlainText(config, logger);

		fileManager.write(join(testDir, "version.txt"), "1.2.4");

		const newVersion = readFileSync(join(testDir, "version.txt"), "utf-8");

		expect(newVersion).toEqual("1.2.4");

		deleteTestDir();
	});
});
