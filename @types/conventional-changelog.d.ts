declare module "conventional-changelog" {
	import steam from "node:stream";
	import gitRawCommits from "git-raw-commits";

	interface IOptions {
		cwd?: string;
		preset?:
			| string
			| {
					name: string;
					preMajor?: boolean;
					[_: string]: unknown;
			  };
		tagPrefix?: string;
		warn?: (...message: string[]) => void;
	}

	interface IContext {
		version: string;
	}

	declare function conventionalChangelog(
		options: IOptions,
		context: IContext,
		gitRawCommitsOpts: gitRawCommits.GitOptions,
	): steam.Readable;

	export default conventionalChangelog;
}
