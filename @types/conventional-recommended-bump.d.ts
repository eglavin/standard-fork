declare module "conventional-recommended-bump" {
	import { GitOptions } from "git-raw-commits";

	interface Options {
		cwd: string;
		lernaPackage: string;
		path: string;
		preset: string;
		tagPrefix: string;

		ignoreReverted: boolean;
		skipUnstable: boolean;

		config: Record<string, unknown>;
		gitRawCommitsOpts: Record<string, unknown>;

		whatBump: (commits: string[]) => {
			level: number;
			reason: string;
		};
	}

	declare function conventionalRecommendedBump(optionsArgument: Partial<Options>): Promise<{
		level: number;
		reason: string;
		releaseType: "major" | "minor" | "patch" | undefined;
	}> {};

	export default conventionalRecommendedBump;
}
