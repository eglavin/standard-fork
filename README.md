# Fork-Version

[![NPM Version](https://img.shields.io/npm/v/fork-version)](https://www.npmjs.com/package/fork-version)
[![Version Package](https://github.com/eglavin/fork-version/actions/workflows/version.yml/badge.svg)](https://github.com/eglavin/fork-version/actions/workflows/version.yml)
[![Publish Package](https://github.com/eglavin/fork-version/actions/workflows/release.yml/badge.svg)](https://github.com/eglavin/fork-version/actions/workflows/release.yml)

<p align="center">
  <img src="assets/fork-version-logo.svg" alt="Fork Version Icon" width="200px">
</p>

<p align="center">
Fork-Version automates version control tasks such as determining, updating, and committing versions, files, and changelogs, simplifying the versioning process when adhering to the <a href="https://www.conventionalcommits.org">conventional commit</a> standard.
</p>

<details>
<summary>This project is essentially a complete re-write of standard-version following on from its deprecation in May 2022.</summary>
Although there are many alternatives such as <a href=https://github.com/googleapis/release-please>release-please</a>. This project aims to continue focusing on just the versioning and changelog generation aspect of the process for use in other Git hosts outside of Github.
</details>

## What Does Fork-Version Do?

By following the [conventional commit](https://www.conventionalcommits.org) standard Fork-Version can automate the following tasks for you:

1. Determine the current and next version
1. Update the version in the selected files
1. Update your changelog
1. Commit the changed files
1. Create a tag for the new version

## Using Fork-Version

Primarily designed to be used with `npx`, Fork-Version can also be installed globally or directly to the node package you're working on. The only software prerequisites you need are [git](https://git-scm.com) and [node](https://nodejs.org).

Fork-Version can be configured either through a config file or by passing options to the tool when ran, see the [Configuration File](#configuration-file) and [Command Line Options](#command-line-options) sections below for details on the supported options.

> [!NOTE]
> Command line options override defined config file options.

### Using `npx` (Recommended)

To use Fork-Version with `npx` you can use the following command, by using `npx` you can also use Fork-Version without installation and on other projects including non node projects.

```sh
npx fork-version
```

> [!NOTE]
> If you want to use a specific version you can add a version tag to the end of the name.
>
> Example: `npx fork-version@1.4.67`
>
> The version tag needs to match against one of the [published versions on npm](https://www.npmjs.com/package/fork-version?activeTab=versions).

### Install Locally

To install the package locally to your project you can use one of the following commands:

| Package Manager | Install Command                       |
| --------------- | ------------------------------------- |
| npm             | `npm install fork-version --save-dev` |
| yarn            | `yarn add fork-version --dev`         |
| pnpm            | `pnpm add fork-version --save-dev`    |

You can then add the following entry to your package.json scripts section and use it like any other script you already use in your project.

```json
{
  "scripts": {
    "release": "fork-version"
  }
}
```

For example if you use npm you can now use `npm run release` to run Fork-Version.

### Command Line Options

<!-- START COMMAND LINE OPTIONS -->

```text
Usage:
  $ fork-version [options]

Commands:
  --help                Show this help message.
  --version             Show the current version of fork-version.
  --inspect-version     If set, fork-version will print the current project version and exit.

Options:
  --file, -F            List of the files to be updated. [Default: ["bower.json", "manifest.json", "npm-shrinkwrap.json", "package-lock.json", "package.json"]]
  --glob, -G            Glob pattern to match files to be updated.
  --path, -P            The path fork-version will run from. [Default: process.cwd()]
  --changelog           Name of the changelog file. [Default: "CHANGELOG.md"]
  --header              The header text for the changelog.
  --tag-prefix          Specify a prefix for the created tag. [Default: "v"]
  --pre-release         Mark this release as a pre-release.
  --pre-release-tag     Mark this release with a tagged pre-release. [Example: "alpha", "beta", "rc"]
  --current-version     If set, fork-version will use this version instead of trying to determine one.
  --next-version        If set, fork-version will attempt to update to this version, instead of incrementing using "conventional-commit".

Flags:
  --commit-all          Commit all changes, not just files updated by fork-version.
  --debug               Output debug information.
  --dry-run             No output will be written to disk or committed.
  --silent              Run without logging to the terminal.
  --git-tag-fallback    If unable to find a version in the given files, fallback and attempt to use the latest git tag. [Default: true]
  --sign                If true, git will sign the commit with the systems GPG key.
  --verify              If true, git will run user defined git hooks before committing.

  To negate a flag you can prefix it with "no-", for example "--no-git-tag-fallback" will not fallback to the latest git tag.
```

<!-- END COMMAND LINE OPTIONS -->

### Configuration File

You can configure Fork-Version using one of the following files:

- [A javascript file](#javascript-config):
  - fork.config.ts
  - fork.config.js
  - fork.config.cjs
  - fork.config.mjs
- [A json file](#json-config):
  - fork.config.json
  - package.json >> Key Name: "fork-version"

#### Javascript Config

Configuring using a javascript file is the most flexible option. You can use any javascript file type you prefer including typescript, both commonjs and esm exports styles are supported. The `defineConfig` function in the following snippet is optional, though using it gives you intellisense information.

```js
import { defineConfig } from 'fork-version';

export default defineConfig({
  header: `# My Changelog`,
  files: ["package.json", "package-lock.json"],
});
```

Alternatively you can use typescript type annotations:

```ts
import type { ForkConfig } from 'fork-version';

const config: ForkConfig = {
  header: `# My Changelog`,
  files: ["package.json", "package-lock.json"],
};

export default config;
```

Or jsdocs:

```js
/** @type {import("fork-version").ForkConfig} */
export default {
  header: `# My Changelog`,
  files: ["package.json", "package-lock.json"],
};
```

Or just raw dog it without type information. ಠ_ಠ

#### Json Config

Another way you can configure Fork-Version is by using a json file called `fork.config.json`. This is a good option if you're using Fork-Version on a non javascript project, or without installation.

If you still want intellisense information you can use the following schema in your json file, otherwise `$schema` is an optional key.

```json
{
  "$schema": "https://raw.githubusercontent.com/eglavin/fork-version/main/schema/latest.json",
  "header": "# My Changelog",
  "files": [
    "package.json",
    "package-lock.json"
  ]
}
```

Internally we're using [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema) to generate the schema. Checkout the [schema folder](./schema/latest.json) to see the current state.

Alternatively you can define your config using a key in your `package.json` file called `fork-version`:

```json
{
  "name": "my-js-project",
  "version": "1.2.3",
  "fork-version": {
    "header": "# My Changelog",
    "files": [
      "package.json",
      "package-lock.json"
    ]
  }
}
```

#### Config Properties

| Property                                              | Type             | Default                 | Description                                                                                    |
| :---------------------------------------------------- | :--------------- | :---------------------- | :--------------------------------------------------------------------------------------------- |
| inspectVersion                                        | boolean          | -                       | Print the current version and exits                                                            |
| [files](#configfiles)                                 | Array\<string>   | `["package.json", ...]` | List of the files to be updated                                                                |
| [glob](#configglob)                                   | string           | -                       | Glob pattern to match files to be updated                                                      |
| path                                                  | string           | `process.cwd()`         | The path fork-version will run from                                                            |
| changelog                                             | string           | `CHANGELOG.md`          | Name of the changelog file                                                                     |
| header                                                | string           | `# Changelog...`        | The header text for the changelog                                                              |
| [tagPrefix](#configtagprefix)                         | string           | `v`                     | Prefix for the created tag                                                                     |
| [preRelease](#configprerelease)                       | string / boolean | -                       | Make a pre-release with optional label if given value is a string                              |
| currentVersion                                        | string           | -                       | Use this version instead of trying to determine one                                            |
| nextVersion                                           | string           | -                       | Attempt to update to this version, instead of incrementing using "conventional-commit"         |
| commitAll                                             | boolean          | false                   | Commit all changes, not just files updated by fork-version                                     |
| debug                                                 | boolean          | false                   | Output debug information                                                                       |
| dryRun                                                | boolean          | false                   | No output will be written to disk or committed                                                 |
| silent                                                | boolean          | false                   | Run without logging to the terminal                                                            |
| gitTagFallback                                        | boolean          | true                    | If unable to find a version in the given files, fallback and attempt to use the latest git tag |
| sign                                                  | boolean          | false                   | Sign the commit with the systems GPG key                                                       |
| verify                                                | boolean          | false                   | Run user defined git hooks before committing                                                   |
| [changelogPresetConfig](#configchangelogpresetconfig) | object           | {}                      | Override defaults from the "conventional-changelog-conventionalcommits" preset configuration   |

##### config.files

By default Fork-Version will attempt to read versions from and update these files, if you define your own list it will override the default list instead of merging.

- "package.json"
- "package-lock.json"
- "npm-shrinkwrap.json"
- "manifest.json"
- "bower.json"

##### config.glob

An alternative to [config.files](#configfiles), a glob allows you to search for files using wildcard characters.

For example if you have the following folder structure:

```text
API/
- MyAPI.csproj
Library/
- MyLibrary.csproj
Web/
- package.json
```

Running `npx fork-version -G "{*/*.csproj,*/package.json}"` will update both csproj files and the package.json file.

Internally we're using [isaacs glob](https://github.com/isaacs/node-glob) to match files, read more about the pattern syntax [here](https://github.com/isaacs/node-glob/tree/v10.3.12?tab=readme-ov-file#glob-primer).

> [!WARNING]
> Ensure you wrap your glob pattern in quotes to prevent shell expansion.

##### config.tagPrefix

Allows you to control the prefix for the created tag. This is useful if your using a mono repo in which you version multiple projects separately or simply want to use a different prefix for your tags.

| Example Value            | Tag Created                   |
|:-------------------------|:------------------------------|
| "v" (Default)            | `v1.2.3`                      |
| ""                       | `1.2.3`                       |
| "version/"               | `version/1.2.3`               |
| "@eglavin/fork-version-" | `@eglavin/fork-version-1.2.3` |

##### config.preRelease

Marking a release as a pre-release allows you to define a change as a patch to a specific version. This allows you to mark a fix for a version or an alpha build for example.

| Example Value | Version Created |
|:--------------|:----------------|
| `true`        | `1.2.3-0`       |
| `alpha`       | `1.2.3-alpha-0` |

Fork-Version uses [meow](https://github.com/sindresorhus/meow) to parse cli arguments which is unable to take a single argument and parse it as either a string and or a boolean. So to do the above through the cli interface you'll need to use two different arguments:

| Example CLI Usage                      | Version Created |
|:---------------------------------------|:----------------|
| `fork-version --pre-release`           | `1.2.3-0`       |
| `fork-version --pre-release-tag alpha` | `1.2.3-alpha-0` |

##### config.changelogPresetConfig

`TODO`

#### Supported File Types

- json package files
- plain text version files
- dotnet csproj files

`TODO`

#### Custom File Updater's

`TODO` [add support for custom file readers and writers through config #5](https://github.com/eglavin/fork-version/issues/5)

### Code Usage

> [!WARNING]
> Code usage is not recommended, as the api is not stable and may change between versions.
>
> In the future this might be stabilized and documented but this is not a focus at this time.
