declare module "conventional-changelog" {
	import type steam from "node:stream";
	import type gitRawCommits from "git-raw-commits";

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

	export default function conventionalChangelog(
		options: IOptions,
		context: IContext,
		gitRawCommitsOpts: gitRawCommits.GitOptions,
		parserOpts?: unknown,
		writerOpts?: unknown,
	): steam.Readable;
}
