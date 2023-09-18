import fs from "node:fs";

export class FileSystem {
	constructor(private writeChanges: boolean = false) {}

	public ReadFile(filePath: fs.PathOrFileDescriptor): string {
		return fs.readFileSync(filePath, "utf8");
	}

	public WriteFile(filePath: fs.PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) {
		if (this.writeChanges) {
			fs.writeFileSync(filePath, content, "utf8");
		}
	}
}
