import { trimStringArray } from "../utils/trim-string-array";

export interface ParserOptions {
	subjectPattern: RegExp;

	mergePattern: RegExp;

	revertPattern: RegExp;

	/**
	 * Pattern to match comments, setting to `null` will disable comment trimming
	 */
	commentPattern: RegExp | null;

	mentionPattern: RegExp;

	/**
	 * List of action labels to match reference sections
	 * @default
	 * ["close", "closes", "closed", "fix", "fixes", "fixed", "resolve", "resolves", "resolved"]
	 */
	referenceActions?: string[];
	referenceActionPattern: RegExp;

	/**
	 * List of issue prefixes to match issue ids
	 * @default
	 * ["#"]
	 */
	issuePrefixes?: string[];
	issuePattern: RegExp;

	noteKeywords?: string[];
	notePattern: RegExp;
}

export function createParserOptions(userOptions?: Partial<ParserOptions>): ParserOptions {
	const referenceActions = (
		trimStringArray(userOptions?.referenceActions) ?? [
			"close",
			"closes",
			"closed",
			"fix",
			"fixes",
			"fixed",
			"resolve",
			"resolves",
			"resolved",
		]
	).join("|");

	const issuePrefixes = (trimStringArray(userOptions?.issuePrefixes) ?? ["#"]).join("|");

	const noteKeywords = (
		trimStringArray(userOptions?.noteKeywords) ?? ["BREAKING CHANGE", "BREAKING-CHANGE"]
	).join("|");

	return {
		subjectPattern: /^(?<type>\w+)(?:\((?<scope>.*)\))?(?<breakingChange>!)?:\s+(?<title>.*)/,

		mergePattern: /^Merge pull request #(?<id>\d*) from (?<source>.*)/,

		revertPattern: /^Revert "(?<subject>.*)"(\s*This reverts commit (?<hash>[a-zA-Z0-9]*)\.)?/,

		commentPattern: /^#(?!\d+\s)/,

		mentionPattern: /(?<!\w)@([\w-]+)/,

		referenceActionPattern: new RegExp(
			`(?<action>${referenceActions})(?:\\s+(?<reference>.*?))(?=(?:${referenceActions})|$)`,
		),

		issuePattern: new RegExp(
			`(?:.*?)??\\s*(?<repository>[\\w-\\.\\/]*?)??(?<prefix>${issuePrefixes})(?<issue>[\\w-]*\\d+)`,
		),

		notePattern: new RegExp(`^(?<title>${noteKeywords}):(\\s*(?<text>.*))`),

		// Override defaults with user options
		...userOptions,
	};
}
