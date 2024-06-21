declare module "git-semver-tags" {
	interface IOptions {
		lernaTags: string;
		package: string;
		tagPrefix: string;
		skipUnstable: boolean;
	}

	export default function gitSemverTags(options: Partial<IOptions>): Promise<string[]>;
}
