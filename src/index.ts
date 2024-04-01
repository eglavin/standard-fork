export { ForkConfigSchema, type ForkConfig, defineConfig } from "./config/schema";
export { getUserConfig } from "./config/user-config";

export {
	getCurrentVersion,
	getNextVersion,
	type CurrentVersion,
	type NextVersion,
} from "./process/version";
export { updateChangelog } from "./process/changelog";
export { commitChanges } from "./process/commit";
export { tagChanges } from "./process/tag";

export { FileManager, type FileState, type IFileManager } from "./strategies/file-manager";
