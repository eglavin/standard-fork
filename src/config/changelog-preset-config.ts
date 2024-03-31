import conventionalChangelogConfigSpec from "conventional-changelog-config-spec";

import type { ForkConfig } from "./schema";

export function getChangelogPresetConfig(
	usersChangelogPresetConfig?: ForkConfig["changelogPresetConfig"],
) {
	const preset: { name: string; [_: string]: unknown } = {
		name: "conventionalcommits",
	};

	// First take any default values from the conventional-changelog-config-spec
	if (typeof conventionalChangelogConfigSpec.properties === "object") {
		Object.entries(conventionalChangelogConfigSpec.properties).forEach(([key, value]) => {
			if ("default" in value && value.default !== undefined) {
				preset[key] = value.default;
			}
		});
	}

	// Then overwrite with any values from the users config
	if (usersChangelogPresetConfig && typeof usersChangelogPresetConfig === "object") {
		Object.entries(usersChangelogPresetConfig).forEach(([key, value]) => {
			if (value !== undefined) {
				preset[key] = value;
			}
		});
	}

	return preset;
}
