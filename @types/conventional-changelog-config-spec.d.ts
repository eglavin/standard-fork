declare module "conventional-changelog-config-spec" {
	import type { JSONSchema7 } from "json-schema";

	const thing: {
		properties: Record<string, JSONSchema7>;
	};
	export default thing;
}
