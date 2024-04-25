declare module "dotgitignore" {
	export default function (opts: { cwd: string }): {
		ignore: (path: string) => boolean;
	};
}
