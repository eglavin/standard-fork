import { trimStringArray } from "../utils/trim-string-array";

export interface ParserOptions {
	/**
	 * Pattern to match commit subjects
	 * - Expected capture groups: `type` `title`
	 * - Optional capture groups: `scope`, `breakingChange`
	 */
	subjectPattern: RegExp | undefined;

	/**
	 * Pattern to match merge commits
	 * - Expected capture groups: `id`, `source`
	 */
	mergePattern: RegExp | undefined;

	/**
	 * Pattern to match revert commits
	 * - Expected capture groups: `subject`, `hash`
	 */
	revertPattern: RegExp | undefined;

	/**
	 * Pattern to match commented out lines which will be trimmed
	 */
	commentPattern: RegExp | undefined;

	/**
	 * Pattern to match mentions
	 * - Expected capture groups: `username`
	 */
	mentionPattern: RegExp | undefined;

	/**
	 * List of action labels to match reference sections
	 * @default
	 * ["close", "closes", "closed", "fix", "fixes", "fixed", "resolve", "resolves", "resolved"]
	 */
	referenceActions?: string[];
	/**
	 * Pattern to match reference sections
	 * - Expected capture groups: `action`, `reference`
	 */
	referenceActionPattern: RegExp | undefined;

	/**
	 * List of issue prefixes to match issue ids
	 * @default
	 * ["#"]
	 */
	issuePrefixes?: string[];
	/**
	 * Pattern to match issue references
	 * - Expected capture groups: `repository`, `prefix`, `issue`
	 */
	issuePattern: RegExp | undefined;

	/**
	 * List of keywords to match note titles
	 * @default
	 * ["BREAKING CHANGE", "BREAKING-CHANGE"]
	 */
	noteKeywords?: string[];
	/**
	 * Pattern to match note sections
	 * - Expected capture groups: `title`
	 * - Optional capture groups: `text`
	 */
	notePattern: RegExp | undefined;
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

		mentionPattern: /(?<!\w)@(?<username>[\w-]+)/,

		referenceActionPattern: referenceActions
			? new RegExp(
					`(?<action>${referenceActions})(?:\\s+(?<reference>.*?))(?=(?:${referenceActions})|$)`,
				)
			: undefined,

		issuePattern: issuePrefixes
			? new RegExp(
					`(?:.*?)??\\s*(?<repository>[\\w-\\.\\/]*?)??(?<prefix>${issuePrefixes})(?<issue>[\\w-]*\\d+)`,
				)
			: undefined,

		notePattern: noteKeywords
			? new RegExp(`^(?<title>${noteKeywords}):(\\s*(?<text>.*))`)
			: undefined,

		// Override defaults with user options
		...userOptions,
	};
}
