// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
// Minimal display-width measurement (East Asian Width + zero-width handling).
//
// POC stand-in: clayterm already vendors wcwidth.c — the production path is to
// export that from @bomb.sh/tty and call it here, rather than ship string-width
// as a runtime dep. Kept small and dependency-free for the spike.

export function charWidth(cp: number): number {
	if (cp === 0) return 0;
	// C0/C1 control characters
	if (cp < 32 || (cp >= 0x7f && cp < 0xa0)) return 0;
	// Combining marks / zero-width
	if (
		(cp >= 0x0300 && cp <= 0x036f) || // combining diacritical marks
		(cp >= 0x200b && cp <= 0x200f) || // zero-width space..RLM
		cp === 0xfeff || // zero-width no-break space
		(cp >= 0xfe00 && cp <= 0xfe0f) // variation selectors
	) {
		return 0;
	}
	return isWide(cp) ? 2 : 1;
}

function isWide(cp: number): boolean {
	return (
		(cp >= 0x1100 && cp <= 0x115f) || // Hangul Jamo
		cp === 0x2329 || cp === 0x232a ||
		(cp >= 0x2e80 && cp <= 0x303e) || // CJK radicals .. Kangxi
		(cp >= 0x3041 && cp <= 0x33ff) || // Hiragana, Katakana, CJK symbols
		(cp >= 0x3400 && cp <= 0x4dbf) || // CJK Ext A
		(cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified Ideographs
		(cp >= 0xa000 && cp <= 0xa4cf) || // Yi
		(cp >= 0xac00 && cp <= 0xd7a3) || // Hangul Syllables
		(cp >= 0xf900 && cp <= 0xfaff) || // CJK Compatibility Ideographs
		(cp >= 0xfe10 && cp <= 0xfe19) || // Vertical forms
		(cp >= 0xfe30 && cp <= 0xfe6f) || // CJK Compatibility Forms
		(cp >= 0xff00 && cp <= 0xff60) || // Fullwidth Forms
		(cp >= 0xffe0 && cp <= 0xffe6) ||
		(cp >= 0x1f300 && cp <= 0x1faff) || // emoji & symbols
		(cp >= 0x20000 && cp <= 0x3fffd) // CJK Ext B+
	);
}

/** Display columns occupied by a string. */
export function stringWidth(s: string): number {
	let width = 0;
	for (const ch of s) width += charWidth(ch.codePointAt(0)!);
	return width;
}

/** Longest prefix of `s` whose display width is ≤ maxWidth (never splits a wide char). */
export function sliceStartByWidth(s: string, maxWidth: number): string {
	let width = 0;
	let out = '';
	for (const ch of s) {
		const cw = charWidth(ch.codePointAt(0)!);
		if (width + cw > maxWidth) break;
		width += cw;
		out += ch;
	}
	return out;
}

/** Longest suffix of `s` whose display width is ≤ maxWidth. */
export function sliceEndByWidth(s: string, maxWidth: number): string {
	const chars = [...s];
	let width = 0;
	let start = chars.length;
	for (let i = chars.length - 1; i >= 0; i--) {
		const cw = charWidth(chars[i]!.codePointAt(0)!);
		if (width + cw > maxWidth) break;
		width += cw;
		start = i;
	}
	return chars.slice(start).join('');
}
