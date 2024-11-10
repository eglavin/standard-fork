import { readFileSync } from "node:fs";

import { setupTest } from "../../../tests/setup-tests";
import { PlainText } from "../plain-text";

describe("files plain-text", () => {
	it("should be able to read version from version.txt file", async () => {
		const { config, create, logger } = await setupTest("files plain-text");
		const fileManager = new PlainText(config, logger);

		create.file("1.2.3", "version.txt");

		const file = fileManager.read("version.txt");

		expect(file?.version).toBe("1.2.3");
	});

	it('should log a warning when "version.txt" file is not found', async () => {
		const { config, logger } = await setupTest("files plain-text");
		const fileManager = new PlainText(config, logger);

		const file = fileManager.read("version.txt");

		expect(file).toBeUndefined();
		expect(logger.warn).toHaveBeenCalledWith(
			"[File Manager] Unable to determine plain text version: version.txt",
		);
	});

	it("should return empty string when version.txt is empty", async () => {
		const { config, create, logger, relativeTo } = await setupTest("files plain-text");
		const fileManager = new PlainText(config, logger);

		create.file("", "version.txt");

		const file = fileManager.read(relativeTo("version.txt"));

		expect(file?.version).toBe("");
	});

	it("should be able to write version to version.txt file", async () => {
		const { config, create, logger, relativeTo } = await setupTest("files plain-text");
		const fileManager = new PlainText(config, logger);

		create.file("1.2.3", "version.txt");

		fileManager.write(
			{
				name: "version.txt",
				path: relativeTo("version.txt"),
				version: "1.2.3",
			},
			"1.2.4",
		);
		const newVersion = readFileSync(relativeTo("version.txt"), "utf-8");

		expect(newVersion).toBe("1.2.4");
	});

	it('should match "version.txt" file name', async () => {
		const { config, logger } = await setupTest("files plain-text");
		const fileManager = new PlainText(config, logger);

		// Supported
		expect(fileManager.isSupportedFile("version.txt")).toBe(true);

		// Not supported
		expect(fileManager.isSupportedFile("version.md")).toBe(false);
	});
});
