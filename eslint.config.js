// @ts-check

import globals from "globals";
import tsEslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tsEslint.config(
	...tsEslint.configs.stylisticTypeChecked,
	{
		ignores: ["coverage/**/*", "dist/**/*", "node_modules/**/*"],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.es2021,
			},
		},
	},
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.build.json",
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: ["src/**/*.test.ts"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.test.json",
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: ["**/*.ts"],
		rules: {
			"no-console": 0,
			"no-undef": 0,
			"no-unused-vars": 0,

			"@typescript-eslint/no-empty-function": 0,
			"@typescript-eslint/no-explicit-any": 1,
			"@typescript-eslint/no-non-null-assertion": 1,
			"@typescript-eslint/no-unused-vars": [
				1,
				{
					ignoreRestSiblings: true,
					caughtErrorsIgnorePattern: "^_",
					argsIgnorePattern: "^_",
				},
			],
		},
	},
	{
		files: ["**/*.js"],
		...tsEslint.configs.disableTypeChecked,
	},
	{
		ignores: ["coverage/**/*", "dist/**/*", "node_modules/**/*"],
		...eslintPluginPrettierRecommended,
	},
);
