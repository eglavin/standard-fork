import { describe, it, expect } from "vitest";
import { stringifyPackage } from "../stringify-package.js";

const TEST_JSON = {
	name: "fork-version",
	version: "1.4.15",
};

describe("stringifyPackage", () => {
	it("should return a string with default args", () => {
		expect(stringifyPackage(TEST_JSON)).toBe(
			'{\n  "name": "fork-version",\n  "version": "1.4.15"\n}',
		);
	});

	it("should return a string with CRLF line endings", () => {
		expect(stringifyPackage(TEST_JSON, undefined, "\r\n")).toBe(
			'{\r\n  "name": "fork-version",\r\n  "version": "1.4.15"\r\n}',
		);
	});

	it("should return a string with 4 space indentation", () => {
		expect(stringifyPackage(TEST_JSON, 4)).toBe(
			'{\n    "name": "fork-version",\n    "version": "1.4.15"\n}',
		);
	});

	it("should return a string with 0 space indentation", () => {
		expect(stringifyPackage(TEST_JSON, 0)).toBe('{"name":"fork-version","version":"1.4.15"}');
	});

	it("should return a string with tab indentation", () => {
		expect(stringifyPackage(TEST_JSON, "\t")).toBe(
			'{\n\t"name": "fork-version",\n\t"version": "1.4.15"\n}',
		);
	});
});
