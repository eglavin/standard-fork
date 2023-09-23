import fs from "node:fs";

export class FileSystem {
	constructor(private writeChanges: boolean = false) {}

	public exists(filePath: fs.PathLike): boolean {
		return fs.existsSync(filePath);
	}

	public read(filePath: fs.PathOrFileDescriptor): string {
		return fs.readFileSync(filePath, "utf8");
	}

	public write(filePath: fs.PathOrFileDescriptor, content: string | NodeJS.ArrayBufferView) {
		if (this.writeChanges) {
			fs.writeFileSync(filePath, content, "utf8");
		}
	}
}
