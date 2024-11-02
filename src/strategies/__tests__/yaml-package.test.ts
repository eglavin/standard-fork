import { createTestDir } from "../../../tests/create-test-directory.js";
import { YAMLPackage } from "../yaml-package.js";

describe("strategies yaml-package", () => {
	it("should read a flutter pubspec.yaml file", async () => {
		const { config, logger, createFile } = await createTestDir("strategies yaml-package");
		const fileManager = new YAMLPackage(config, logger);

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

	it("should read a regular yaml file", async () => {
		const { config, logger, createFile } = await createTestDir("strategies yaml-package");
		const fileManager = new YAMLPackage(config, logger);

		createFile(
			`name: My Project
version: 1.2.3 # Comment about the version number
`,
			"my-project.yaml",
		);

		const file = fileManager.read("my-project.yaml");
		expect(file?.version).toEqual("1.2.3");
		expect(file?.builderNumber).toEqual(undefined);
	});

	it("should log a message if unable to read version", async () => {
		const { config, logger, createFile } = await createTestDir("strategies yaml-package");
		const fileManager = new YAMLPackage(config, logger);

		createFile(
			`name: wordionary
description: "A new Flutter project."
publish_to: 'none'
environment:
  sdk: ^3.5.4
`,
			"pubspec.yaml",
		);

		const file = fileManager.read("pubspec.yaml");
		expect(file?.version).toEqual(undefined);
		expect(file?.builderNumber).toEqual(undefined);
	});

	it("should write a flutter pubspec.yaml file", async () => {
		const { relativeTo, config, logger, createAndCommitFile } =
			await createTestDir("strategies yaml-package");
		const fileManager = new YAMLPackage(config, logger);

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

	it("should write a regular yaml file", async () => {
		const { relativeTo, config, logger, createAndCommitFile } =
			await createTestDir("strategies yaml-package");
		const fileManager = new YAMLPackage(config, logger);

		createAndCommitFile(
			`name: My Project
version: 1.2.3 # Comment about the version number
`,
			"my-project.yaml",
		);

		fileManager.write(
			{
				name: "my-project.yaml",
				path: relativeTo("my-project.yaml"),
				version: "1.2.3",
				builderNumber: undefined,
			},
			"2.4.6",
		);

		const file = fileManager.read(relativeTo("my-project.yaml"));
		expect(file?.version).toEqual("2.4.6");
		expect(file?.builderNumber).toEqual(undefined);
	});

	it("should match known yaml files", async () => {
		const { config, logger } = await createTestDir("strategies yaml-package");
		const fileManager = new YAMLPackage(config, logger);

		// Supported
		expect(fileManager.isSupportedFile("pubspec.yaml")).toBe(true);
		expect(fileManager.isSupportedFile("pubspec.yml")).toBe(true);
		expect(fileManager.isSupportedFile("my-project.yaml")).toBe(true);
		expect(fileManager.isSupportedFile("my-project.yml")).toBe(true);

		// Not supported
		expect(fileManager.isSupportedFile("my-project.toml")).toBe(false);
		expect(fileManager.isSupportedFile("my-project")).toBe(false);
	});
});
