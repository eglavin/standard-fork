export { ForkConfigSchema } from "./config/schema.js";
export type { ForkConfig, Config } from "./config/types.js";
export { getUserConfig, defineConfig } from "./config/user-config.js";

export {
	getCurrentVersion,
	getNextVersion,
	type CurrentVersion,
	type NextVersion,
} from "./process/version.js";
export { updateChangelog } from "./process/changelog.js";
export { commitChanges } from "./process/commit.js";
export { tagChanges } from "./process/tag.js";

export { FileManager, type FileState, type IFileManager } from "./strategies/file-manager.js";
export { Logger } from "./utils/logger.js";
