import { vi } from "vitest";
import { ForkConfig } from "../src/configuration/schema.js";
import { getForkConfig } from "../src/configuration/user-config.js";

export async function createTestConfig(testPath: string): Promise<ForkConfig> {
	const config = await getForkConfig();

	config.workingDirectory = testPath;
	config.log = vi.fn(() => {});
	config.error = vi.fn(() => {});
	config.debug = vi.fn(() => {});

	return config;
}
