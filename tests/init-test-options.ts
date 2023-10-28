import { vi } from "vitest";
import { ForkConfig, getForkConfig } from "../src/configuration.js";

export async function createTestConfig(testPath: string): Promise<ForkConfig> {
	const options = await getForkConfig();

	options.changePath = testPath;
	options.log = vi.fn(() => {});
	options.error = vi.fn(() => {});
	options.debug = vi.fn(() => {});

	return options;
}
