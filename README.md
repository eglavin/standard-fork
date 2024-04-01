# Fork-Version

[![npm version](https://badge.fury.io/js/fork-version.svg)](https://www.npmjs.com/package/fork-version)
[![Version Package](https://github.com/eglavin/fork-version/actions/workflows/version.yml/badge.svg)](https://github.com/eglavin/fork-version/actions/workflows/version.yml)
[![Publish Package](https://github.com/eglavin/fork-version/actions/workflows/release.yml/badge.svg)](https://github.com/eglavin/fork-version/actions/workflows/release.yml)

Fork-version is a re-write of [standard-version](https://github.com/conventional-changelog/standard-version) following on from its deprecation in May 15, 2022.

## Installation

To install the package locally to your project you can use one of the following commands:

| Manager | Command                                            |
| ------- | -------------------------------------------------- |
| npm     | `npm install fork-version --save-exact --save-dev` |
| yarn    | `yarn add fork-version --exact --dev`              |
| pnpm    | `pnpm add fork-version --save-exact --save-dev`    |

Otherwise you can use `npx` to run the package without installation like so:

```bash
npx fork-version
```

## Code Coverage

<!-- Code Coverage Table Start -->

![Code Coverage](https://img.shields.io/badge/Code%20Coverage-75%25-yellow?style=flat)

| Package        | Line Rate            | Branch Rate       | Complexity | Health |
| -------------- | -------------------- | ----------------- | ---------- | ------ |
| src            | 22%                  | 0%                | 0          | ❌     |
| src.config     | 98%                  | 62%               | 0          | ✔     |
| src.libs       | 100%                 | 100%              | 0          | ✔     |
| src.process    | 46%                  | 75%               | 0          | ❌     |
| src.strategies | 76%                  | 75%               | 0          | ➖     |
| src.utils      | 100%                 | 100%              | 0          | ✔     |
| **Summary**    | **75%** (877 / 1174) | **85%** (78 / 92) | **0**      | ➖     |

<!-- Code Coverage Table End -->
