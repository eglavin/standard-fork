declare module "git-semver-tags" {
	interface IOptions {
		lernaTags: string;
		package: string;
		tagPrefix: string;
		skipUnstable: boolean;
	}

	declare function gitSemverTags(options: Partial<IOptions>): Promise<string[]>;

	export default gitSemverTags;
}
