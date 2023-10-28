import { ForkConfig, getForkConfig } from "../src/configuration.js";

export async function createTestConfig(testPath: string): Promise<ForkConfig> {
	const options = await getForkConfig();

	options.changePath = testPath;
	options.log = () => {};
	options.error = () => {};
	options.debug = () => {};

	return options;
}
