// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
// Strips all ANSI and C1 control sequences from text content.
// Clayterm renders ESC (0x1B) as U+FFFD — removing all escape sequences
// before passing to Clayterm gives clean text and fixes the "strip ANSI" tests.
// Incomplete sequences at end of input are stripped to prevent payload leaks.
export function sanitizeAnsi(input: string): string {
	const out: string[] = [];
	const len = input.length;
	let i = 0;

	while (i < len) {
		const cp = input.charCodeAt(i);
		if (cp === 0x1B) {
			i = processEsc(input, i, len, out);
		} else if (cp >= 0x80 && cp <= 0x9F) {
			i = processC1(input, i, len, out);
		} else {
			out.push(input[i++]!);
		}
	}

	return out.join('');
}

function processEsc(input: string, start: number, len: number, _out: string[]): number {
	if (start + 1 >= len) return len; // incomplete ESC — drop

	const next = input.charCodeAt(start + 1);

	if (next === 0x5B) return consumeCsi(input, start + 2, len);                           // ESC [ → CSI
	if (next === 0x5D) return consumeOsc(input, start + 2, len);                           // ESC ] → OSC
	if (next === 0x50 || next === 0x5E || next === 0x5F || next === 0x58)
		return consumeStringSeq(input, start + 2, len);                                      // DCS/PM/APC/SOS
	if (next === 0x5C) return start + 2;                                                    // ESC \ (ST) — drop 2
	if (next >= 0x20 && next <= 0x2F) return consumeEscIntermediate(input, start + 1, len); // intermediates
	if (next >= 0x40 && next <= 0x7E) return start + 2;                                    // 2-byte Fs/Fp — drop 2
	return start + 1;                                                                       // unknown — drop ESC only
}

function processC1(input: string, start: number, len: number, _out: string[]): number {
	const cp = input.charCodeAt(start);
	if (cp === 0x9B) return consumeCsi(input, start + 1, len);        // C1 CSI
	if (cp === 0x9D) return consumeOsc(input, start + 1, len);        // C1 OSC
	if (cp === 0x90 || cp === 0x9E || cp === 0x9F || cp === 0x98)
		return consumeStringSeq(input, start + 1, len);                  // C1 DCS/PM/APC/SOS
	return start + 1;                                                  // other C1 (ST, NEL, SS2, etc.) — drop
}

// Consume CSI: param bytes (0x30–0x3F) + intermediate bytes (0x20–0x2F) + final byte (0x40–0x7E).
function consumeCsi(input: string, i: number, len: number): number {
	while (i < len && input.charCodeAt(i) >= 0x30 && input.charCodeAt(i) <= 0x3F) i++;
	while (i < len && input.charCodeAt(i) >= 0x20 && input.charCodeAt(i) <= 0x2F) i++;
	if (i < len && input.charCodeAt(i) >= 0x40 && input.charCodeAt(i) <= 0x7E) i++;
	return i;
}

// Consume ESC + intermediates + final byte (0x30–0x7E).
// If a non-final, non-intermediate byte follows (e.g. BEL 0x07 = malformed), strip to end of input.
function consumeEscIntermediate(input: string, i: number, len: number): number {
	while (i < len && input.charCodeAt(i) >= 0x20 && input.charCodeAt(i) <= 0x2F) i++;
	if (i >= len) return len;
	const fc = input.charCodeAt(i);
	if (fc >= 0x30 && fc <= 0x7E) return i + 1; // valid nF final byte
	return len; // malformed — strip to end to prevent payload leaks
}

// Consume OSC string terminated by BEL (0x07), C1 ST (0x9C), or ESC \ (0x1B 0x5C).
function consumeOsc(input: string, i: number, len: number): number {
	while (i < len) {
		const cp = input.charCodeAt(i);
		if (cp === 0x07) return i + 1; // BEL
		if (cp === 0x9C) return i + 1; // C1 ST
		if (cp === 0x1B) {
			if (i + 1 < len && input.charCodeAt(i + 1) === 0x5C) return i + 2; // ESC \
			i++;
			continue;
		}
		i++;
	}
	return len; // incomplete — consume to end
}

// Consume DCS/PM/APC/SOS string terminated by C1 ST (0x9C) or ESC \ (0x1B 0x5C).
// BEL is NOT a terminator for these (only for OSC).
function consumeStringSeq(input: string, i: number, len: number): number {
	while (i < len) {
		const cp = input.charCodeAt(i);
		if (cp === 0x9C) return i + 1;
		if (cp === 0x1B) {
			if (i + 1 < len && input.charCodeAt(i + 1) === 0x5C) return i + 2;
			i++;
			continue;
		}
		i++;
	}
	return len;
}
