import { getUserConfig } from "../src/config/user-config";
import { Logger } from "../src/utils/logger";

export async function createTestConfig(testPath: string) {
	const config = await getUserConfig();
	config.workingDirectory = testPath;

	const logger = new Logger({ silent: true });
	logger.log = vi.fn();
	logger.warn = vi.fn();
	logger.error = vi.fn();
	logger.debug = vi.fn();

	return {
		config,
		logger,
	};
}
