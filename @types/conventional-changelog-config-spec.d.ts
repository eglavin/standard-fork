declare module "conventional-changelog-config-spec" {
	import type { JSONSchema7 } from "json-schema";

	const schema: {
		properties: Record<string, JSONSchema7>;
	};
	export default schema;
}
