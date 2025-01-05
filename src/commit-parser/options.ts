import { trimStringArray } from "../utils/trim-string-array";

export interface ParserOptions {
	/**
	 * Pattern to match commit subjects
	 * - Expected capture groups: `type` `title`
	 * - Optional capture groups: `scope`, `breakingChange`
	 */
	subjectPattern: RegExp;

	/**
	 * Pattern to match merge commits
	 * - Expected capture groups: `id`, `source`
	 */
	mergePattern: RegExp;

	/**
	 * Pattern to match revert commits
	 * - Expected capture groups: `subject`, `hash`
	 */
	revertPattern: RegExp;

	/**
	 * Pattern to match commented out lines which will be trimmed
	 *
	 * Setting to `null` will disable comment trimming
	 */
	commentPattern: RegExp | null;

	/**
	 * Pattern to match mentions
	 * - Expected capture groups: `username`
	 */
	mentionPattern: RegExp;

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
	referenceActionPattern: RegExp;

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
	issuePattern: RegExp;

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

		mentionPattern: /(?<!\w)@(?<username>[\w-]+)/,

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
