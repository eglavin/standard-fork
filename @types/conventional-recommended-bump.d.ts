declare module "conventional-recommended-bump" {
	import gitRawCommits from "git-raw-commits";

	interface Options {
		cwd: string;
		lernaPackage: string;
		path: string;
		preset:
			| string
			| {
					name: string;
					preMajor?: boolean;
					[_: string]: unknown;
			  };
		tagPrefix: string;

		ignoreReverted: boolean;
		skipUnstable: boolean;

		config: Record<string, unknown>;
		gitRawCommitsOpts: gitRawCommits.GitOptions;

		whatBump: (commits: string[]) => {
			level: number;
			reason: string;
		};
	}

	declare function conventionalRecommendedBump(optionsArgument: Partial<Options>): Promise<{
		level: number;
		reason: string;
		releaseType: "major" | "minor" | "patch" | undefined;
	}>;

	export default conventionalRecommendedBump;
}
