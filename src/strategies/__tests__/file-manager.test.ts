import { readFileSync } from "node:fs";

import { createTestDir } from "../../../tests/create-test-directory";
import { FileManager } from "../file-manager";

describe("strategies file-manager", () => {
	it("should read json when file extension is .json", async () => {
		const { config, logger, createJSONFile } = await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		createJSONFile({ version: "1.2.3" }, "package.json");

		const file = fileManager.read("package.json");
		expect(file?.version).toEqual("1.2.3");
	});

	it("should read plain text when file is version.txt", async () => {
		const { config, logger, createFile } = await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		createFile("1.2.3", "version.txt");

		const file = fileManager.read("version.txt");
		expect(file?.version).toEqual("1.2.3");
	});

	it("should log an error when read file type is not supported", async () => {
		const { config, logger, createFile } = await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		createFile("Version: 1.2.3", "version.unknown");

		fileManager.read("version.unknown");
		expect(logger.error).toHaveBeenCalledWith("[File Manager] Unsupported file: version.unknown");
	});

	it("should not write to file if dry run is enabled", async () => {
		const { relativeTo, config, logger } = await createTestDir("strategies file-manager");
		config.dryRun = true;
		const fileManager = new FileManager(config, logger);

		fileManager.write(
			{
				name: "package.json",
				path: relativeTo("package.json"),
				version: "1.2.2",
			},
			"1.2.3",
		);
	});

	it("should write json file when file extension is .json", async () => {
		const { relativeTo, config, logger, createJSONFile } =
			await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		createJSONFile({ version: "1.0.0" }, "package.json");

		fileManager.write(
			{
				name: "package.json",
				path: relativeTo("package.json"),
				version: "1.2.2",
			},
			"1.2.3",
		);
		const packageJSON = JSON.parse(readFileSync(relativeTo("package.json"), "utf-8"));
		expect(packageJSON.version).toEqual("1.2.3");
	});

	it("should write plain text when file is version.txt", async () => {
		const { relativeTo, config, logger, createFile } =
			await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		createFile("1.0.0", "version.txt");

		fileManager.write(
			{
				name: "version.txt",
				path: relativeTo("version.txt"),
				version: "1.2.2",
			},
			"1.2.3",
		);
		const version = readFileSync(relativeTo("version.txt"), "utf-8");
		expect(version).toEqual("1.2.3");
	});

	it("should log an error when write file type is not supported", async () => {
		const { relativeTo, config, logger } = await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		fileManager.write(
			{
				name: "version.unknown",
				path: relativeTo("version.unknown"),
				version: "1.2.2",
			},
			"1.2.3",
		);
		expect(logger.error).toHaveBeenCalledWith(
			`[File Manager] Unsupported file: ${relativeTo("version.unknown")}`,
		);
	});
});
