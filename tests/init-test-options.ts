import { vi } from "vitest";
import { ForkConfig, getForkConfig } from "../src/configuration.js";

export async function createTestConfig(testPath: string): Promise<ForkConfig> {
	const config = await getForkConfig();

	config.workingDirectory = testPath;
	config.log = vi.fn(() => {});
	config.error = vi.fn(() => {});
	config.debug = vi.fn(() => {});

	return config;
}
