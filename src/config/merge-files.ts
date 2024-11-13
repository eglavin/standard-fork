import { DEFAULT_CONFIG } from "./defaults";

export function mergeFiles(
	configFiles: string[] | undefined,
	cliFiles: string[] | undefined,
	globResults: string[],
): string[] {
	const listOfFiles = new Set<string>();

	// Add files from the users config file
	if (Array.isArray(configFiles)) {
		configFiles.forEach((file) => listOfFiles.add(file));
	}

	// Add files from the cli arguments
	if (Array.isArray(cliFiles)) {
		cliFiles.forEach((file) => listOfFiles.add(file));
	}

	// Add files from glob results
	globResults.forEach((file) => listOfFiles.add(file));

	// If the user has defined files use them, otherwise use the default list of files.
	if (listOfFiles.size) {
		return Array.from(listOfFiles);
	}

	return DEFAULT_CONFIG.files;
}
