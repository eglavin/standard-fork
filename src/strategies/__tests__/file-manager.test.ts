import { join } from "node:path";
import { readFileSync } from "node:fs";

import { createTestDir } from "../../../tests/create-test-directory";
import { FileManager } from "../file-manager";

describe("strategies file-manager", () => {
	it("should read json when file extension is .json", async () => {
		const { createJSONFile, createTestConfig } = createTestDir("strategies file-manager");

		createJSONFile({ version: "1.2.3" }, "package.json");

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		const file = fileManager.read("package.json");
		expect(file?.version).toEqual("1.2.3");
	});

	it("should read plain text when file is version.txt", async () => {
		const { createFile, createTestConfig } = createTestDir("strategies file-manager");

		createFile("1.2.3", "version.txt");

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		const file = fileManager.read("version.txt");
		expect(file?.version).toEqual("1.2.3");
	});

	it("should log an error when read file type is not supported", async () => {
		const { createFile, createTestConfig } = createTestDir("strategies file-manager");

		createFile("Version: 1.2.3", "version.unknown");

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		fileManager.read("version.unknown");
		expect(logger.error).toHaveBeenCalledWith("Unsupported file type: version.unknown");
	});

	it("should not write to file if dry run is enabled", async () => {
		const { createTestConfig } = createTestDir("strategies file-manager");

		const { config, logger } = await createTestConfig();
		config.dryRun = true;
		const fileManager = new FileManager(config, logger);

		fileManager.write("package.json", "1.2.3");
	});

	it("should write json file when file extension is .json", async () => {
		const { testDir, createJSONFile, createTestConfig } = createTestDir("strategies file-manager");

		createJSONFile({ version: "1.0.0" }, "package.json");

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		fileManager.write(join(testDir, "package.json"), "1.2.3");

		const packageJSON = JSON.parse(readFileSync(join(testDir, "package.json"), "utf-8"));
		expect(packageJSON.version).toEqual("1.2.3");
	});

	it("should write plain text when file is version.txt", async () => {
		const { testDir, createFile, createTestConfig } = createTestDir("strategies file-manager");

		createFile("1.0.0", "version.txt");

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		fileManager.write(join(testDir, "version.txt"), "1.2.3");

		const version = readFileSync(join(testDir, "version.txt"), "utf-8");
		expect(version).toEqual("1.2.3");
	});

	it("should log an error when write file type is not supported", async () => {
		const { createTestConfig } = createTestDir("strategies file-manager");

		const { config, logger } = await createTestConfig();
		const fileManager = new FileManager(config, logger);

		fileManager.write("version.unknown", "1.2.3");
		expect(logger.error).toHaveBeenCalledWith("Unsupported file type: version.unknown");
	});
});
