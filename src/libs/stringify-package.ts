// https://github.com/npm/stringify-package/blob/main/LICENSE
// Extracted from npm/stringify-package
//
// Copyright npm, Inc
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

const DEFAULT_INDENT = 2;
const CRLF = "\r\n";
const LF = "\n";

/**
 * @param data The object to stringify
 * @param indent `2, 4, "    ", "\t"` Number of spaces a string of spaces or tab character, defaults to 2
 * @param newline `"\r\n", "\n"` Windows or Unix line endings, defaults to Unix
 */
export function stringifyPackage(
	data: object,
	indent?: string | number,
	newline?: typeof CRLF | typeof LF,
): string {
	const stringified = JSON.stringify(data, null, indent ?? (indent === 0 ? 0 : DEFAULT_INDENT));

	if (newline === CRLF) {
		return stringified.replace(new RegExp(LF, "g"), CRLF);
	}

	return stringified;
}
