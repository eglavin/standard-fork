import js from "@eslint/js";
import globals from "globals";

import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	js.configs.recommended,
	{
		ignores: ["**/dist", "**/node_modules"],
		languageOptions: {
			globals: {
				...globals.es2021,
				...globals.node,
			},
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			"no-console": 0,
			"no-unused-vars": 1,
			"prettier/prettier": 1,
		},
	},
	{
		files: ["**/*.ts"],
		plugins: {
			"@typescript-eslint": typescriptPlugin,
		},
		languageOptions: {
			parser: typescriptParser,
		},
		rules: {
			...typescriptPlugin.configs.recommended.rules,

			"no-undef": 0,
			"no-unused-vars": 0,

			"@typescript-eslint/no-explicit-any": 1,
			"@typescript-eslint/no-non-null-assertion": 1,
			"@typescript-eslint/no-unused-vars": [
				1,
				{
					ignoreRestSiblings: true,
					argsIgnorePattern: "^_",
				},
			],
		},
	},
	eslintConfigPrettier,
];
