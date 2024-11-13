import { mergeFiles } from "../merge-files";
import { DEFAULT_CONFIG } from "../defaults";

describe("mergeFiles", () => {
	it("should handle undefined input", async () => {
		expect(mergeFiles(undefined, undefined, [])).toStrictEqual(DEFAULT_CONFIG.files);
		expect(mergeFiles(["file1"], undefined, [])).toStrictEqual(["file1"]);
		expect(mergeFiles(undefined, ["file2"], [])).toStrictEqual(["file2"]);
		expect(mergeFiles(undefined, undefined, ["file3"])).toStrictEqual(["file3"]);
	});

	it("should merge all files", async () => {
		expect(mergeFiles(["file1"], ["file2"], ["file3"])).toStrictEqual(["file1", "file2", "file3"]);
	});

	it("should remove duplicates", async () => {
		expect(mergeFiles(["file1"], ["file1"], ["file1"])).toStrictEqual(["file1"]);
	});
});
