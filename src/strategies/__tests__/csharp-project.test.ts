import { readFileSync } from "node:fs";
import { createTestDir } from "../../../tests/create-test-directory";
import { CSharpProject } from "../csharp-project";

describe("strategies csproj-package", () => {
	it("should read version from csproj file", async () => {
		const { config, logger, createFile } = await createTestDir("strategies csproj-package");
		const fileManager = new CSharpProject(config, logger);

		createFile(
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

	it("should log a message if unable to read version", async () => {
		const { config, logger, createFile } = await createTestDir("strategies csproj-package");
		const fileManager = new CSharpProject(config, logger);

		createFile(
			`<Project Sdk="Microsoft.NET.Sdk">
	<PropertyGroup>
		<Version></Version>
	</PropertyGroup>
</Project>
`,
			"API.csproj",
		);

		const file = fileManager.read("API.csproj");
		expect(file).toBeUndefined();
		expect(logger.warn).toBeCalledWith(
			"[File Manager] Unable to determine csproj package: API.csproj",
		);
	});

	it("should write a csproj file", async () => {
		const { relativeTo, config, logger, createFile } = await createTestDir(
			"strategies csproj-package",
		);
		const fileManager = new CSharpProject(config, logger);

		createFile(
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

	it("should keep the same property ordering", async () => {
		const { relativeTo, config, logger, createFile } = await createTestDir(
			"strategies csproj-package",
		);
		const fileManager = new CSharpProject(config, logger);

		createFile(
			`<Project Sdk="Microsoft.NET.Sdk">

	<PropertyGroup>
		<OutputType>Library</OutputType>
		<TargetFramework>net7.0-windows</TargetFramework>
		<Version>1.2.3</Version>
		<ImplicitUsings>enable</ImplicitUsings>
		<Nullable>enable</Nullable>
	</PropertyGroup>

	<ItemGroup>
		<PackageReference Include="Microsoft.Data.Sqlite" Version="7.0.5" />
		<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="7.0.5" />
		<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="7.0.5">
			<IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
		</PackageReference>
		<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
	</ItemGroup>

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

		const updatedFileContent = readFileSync(relativeTo("API.csproj"), "utf8");

		expect(updatedFileContent).toEqual(
			`<Project Sdk="Microsoft.NET.Sdk">

	<PropertyGroup>
		<OutputType>Library</OutputType>
		<TargetFramework>net7.0-windows</TargetFramework>
		<Version>4.5.6</Version>
		<ImplicitUsings>enable</ImplicitUsings>
		<Nullable>enable</Nullable>
	</PropertyGroup>

	<ItemGroup>
		<PackageReference Include="Microsoft.Data.Sqlite" Version="7.0.5" />
		<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="7.0.5" />
		<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="7.0.5">
			<IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
		</PackageReference>
		<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
	</ItemGroup>

</Project>
`,
		);
	});
});
