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

	it("should read yaml file when the file extension is .yaml", async () => {
		const { config, logger, createFile } = await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		createFile(
			`name: wordionary
description: "A new Flutter project."
publish_to: 'none'
version: 1.2.3+55 # Comment about the version number
environment:
  sdk: ^3.5.4

`,
			"pubspec.yaml",
		);

		const file = fileManager.read("pubspec.yaml");
		expect(file?.version).toEqual("1.2.3");
		expect(file?.builderNumber).toEqual("55");
	});

	it("should read plain text when file is version.txt", async () => {
		const { config, logger, createAndCommitFile } = await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		createAndCommitFile("1.2.3", "version.txt");

		const file = fileManager.read("version.txt");
		expect(file?.version).toEqual("1.2.3");
	});

	it("should read csproj when file extension is csproj", async () => {
		const { config, logger, createAndCommitFile } = await createTestDir(
			"strategies ms-build-project",
		);
		const fileManager = new FileManager(config, logger);

		createAndCommitFile(
			`<Project Sdk="Microsoft.NET.Sdk">
	<PropertyGroup>
		<Version>1.2.3</Version>
	</PropertyGroup>
</Project>
`,
			"API.csproj",
		);

		const file = fileManager.read("API.csproj");
		expect(file?.version).toEqual("1.2.3");
	});

	it("should log an error when read file type is not supported", async () => {
		const { config, logger, createAndCommitFile } = await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		createAndCommitFile("Version: 1.2.3", "version.unknown");

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

	it("should write yaml file when file extension is .yaml", async () => {
		const { relativeTo, config, logger, createAndCommitFile } =
			await createTestDir("strategies yaml-package");
		const fileManager = new FileManager(config, logger);

		createAndCommitFile(
			`name: wordionary
description: "A new Flutter project."
publish_to: 'none'
version: 1.2.3+55 # Comment about the version number
environment:
  sdk: ^3.5.4
`,
			"pubspec.yaml",
		);

		fileManager.write(
			{
				name: "pubspec.yaml",
				path: relativeTo("pubspec.yaml"),
				version: "1.2.3",
				builderNumber: 55,
			},
			"2.4.6",
		);

		const file = fileManager.read(relativeTo("pubspec.yaml"));
		expect(file?.version).toEqual("2.4.6");
		expect(file?.builderNumber).toEqual("55");
	});

	it("should write plain text when file is version.txt", async () => {
		const { relativeTo, config, logger, createAndCommitFile } =
			await createTestDir("strategies file-manager");
		const fileManager = new FileManager(config, logger);

		createAndCommitFile("1.0.0", "version.txt");

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

	it("should write csproj when file extension is csproj", async () => {
		const { relativeTo, config, logger, createAndCommitFile } = await createTestDir(
			"strategies ms-build-project",
		);
		const fileManager = new FileManager(config, logger);

		createAndCommitFile(
			`<Project Sdk="Microsoft.NET.Sdk">
	<PropertyGroup>
		<Version>1.2.3</Version>
	</PropertyGroup>
</Project>
`,
			"API.csproj",
		);

		fileManager.write(
			{
				name: "API.csproj",
				path: relativeTo("API.csproj"),
				version: "1.2.3",
			},
			"4.5.6",
		);

		const file = fileManager.read(relativeTo("API.csproj"));
		expect(file?.version).toEqual("4.5.6");
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
