export { ForkConfigSchema } from "./config/schema";
export type { ForkConfig, Config } from "./config/types";
export { getUserConfig, defineConfig } from "./config/user-config";

export {
	getCurrentVersion,
	getNextVersion,
	type CurrentVersion,
	type NextVersion,
} from "./process/version";
export { updateChangelog } from "./process/changelog";
export { commitChanges } from "./process/commit";
export { tagChanges } from "./process/tag";

export { FileManager, type FileState, type IFileManager } from "./files/file-manager";
export { Logger } from "./utils/logger";
