import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	function escapeCase(id: string, options: { selector: string; matched: boolean }): void {
		const { selector, matched } = options;

		context.test(
			'WPT ParentNode-querySelector-escapes.html: ' +
				JSON.stringify(id) +
				(matched ? ' should match with ' : ' should never match with ') +
				JSON.stringify(selector),
			({ document }) => {
				const container = document.createElement('div');
				const child = document.createElement('span');
				child.id = id;
				container.appendChild(child);
				expect(container.querySelector(selector)).toBe(matched ? child : null);
			},
		);
	}
	// 4.3.7 from https://drafts.csswg.org/css-syntax/#consume-escaped-code-point
	escapeCase('nonescaped', { selector: '#nonescaped', matched: true });

	// - escape hex digit
	escapeCase('0nextIsWhiteSpace', { selector: '#\\30 nextIsWhiteSpace', matched: true });
	escapeCase('0nextIsNotHexLetters', { selector: '#\\30nextIsNotHexLetters', matched: true });
	escapeCase('0connectHexMoreThan6Hex', {
		selector: '#\\000030connectHexMoreThan6Hex',
		matched: true,
	});
	escapeCase('0spaceMoreThan6Hex', { selector: '#\\000030 spaceMoreThan6Hex', matched: true });

	// - hex digit special replacement
	// 1. zero points
	escapeCase('zero\u{fffd}', { selector: '#zero\\0', matched: true });
	escapeCase('zero\u{0}', { selector: '#zero\\0', matched: false });
	escapeCase('zero\u{fffd}', { selector: '#zero\\000000', matched: true });
	escapeCase('zero\u{0}', { selector: '#zero\\000000', matched: false });
	// 2. surrogate points
	escapeCase('\u{fffd}surrogateFirst', { selector: '#\\d83d surrogateFirst', matched: true });
	escapeCase('\ud83dsurrogateFirst', { selector: '#\\d83d surrogateFirst', matched: false });
	escapeCase('surrogateSecond\u{fffd}', { selector: '#surrogateSecond\\dd11', matched: true });
	escapeCase('surrogateSecond\udd11', { selector: '#surrogateSecond\\dd11', matched: false });
	escapeCase('surrogatePair\u{fffd}\u{fffd}', {
		selector: '#surrogatePair\\d83d\\dd11',
		matched: true,
	});
	escapeCase('surrogatePair\u{1f511}', { selector: '#surrogatePair\\d83d\\dd11', matched: false });
	// 3. out of range points
	escapeCase('outOfRange\u{fffd}', { selector: '#outOfRange\\110000', matched: true });
	escapeCase('outOfRange\u{fffd}', { selector: '#outOfRange\\110030', matched: true });
	escapeCase('outOfRange\u{30}', { selector: '#outOfRange\\110030', matched: false });
	escapeCase('outOfRange\u{fffd}', { selector: '#outOfRange\\555555', matched: true });
	escapeCase('outOfRange\u{fffd}', { selector: '#outOfRange\\ffffff', matched: true });

	// - escape EOF
	escapeCase('eof\\', { selector: '#eof\\', matched: false });

	// - escape anythong else
	escapeCase('.comma', { selector: '#\\.comma', matched: true });
	escapeCase('-minus', { selector: '#\\-minus', matched: true });
	escapeCase('g', { selector: '#\\g', matched: true });

	// non edge cases
	escapeCase('aBMPRegular', { selector: '#\\61 BMPRegular', matched: true });
	escapeCase('\u{1f511}nonBMP', { selector: '#\\1f511 nonBMP', matched: true });
	escapeCase('00continueEscapes', { selector: '#\\30\\30 continueEscapes', matched: true });
	escapeCase('00continueEscapes', { selector: '#\\30 \\30 continueEscapes', matched: true });
	escapeCase('continueEscapes00', { selector: '#continueEscapes\\30 \\30 ', matched: true });
	escapeCase('continueEscapes00', { selector: '#continueEscapes\\30 \\30', matched: true });
	escapeCase('continueEscapes00', { selector: '#continueEscapes\\30\\30 ', matched: true });
	escapeCase('continueEscapes00', { selector: '#continueEscapes\\30\\30', matched: true });

	// ident tests case from CSS tests of chromium source: https://goo.gl/3Cxdov
	escapeCase('hello', { selector: '#hel\\6Co', matched: true });
	escapeCase('&B', { selector: '#\\26 B', matched: true });
	escapeCase('hello', { selector: '#hel\\6C o', matched: true });
	escapeCase('spaces', { selector: '#spac\\65\r\ns', matched: true });
	escapeCase('spaces', { selector: '#sp\\61\tc\\65\fs', matched: true });
	escapeCase('test\u{D799}', { selector: '#test\\D799', matched: true });
	escapeCase('\u{E000}', { selector: '#\\E000', matched: true });
	escapeCase('test', { selector: '#te\\s\\t', matched: true });
	escapeCase('spaces in\tident', { selector: '#spaces\\ in\\\tident', matched: true });
	escapeCase('.,:!', { selector: '#\\.\\,\\:\\!', matched: true });
	escapeCase('null\u{fffd}', { selector: '#null\\0', matched: true });
	escapeCase('null\u{fffd}', { selector: '#null\\0000', matched: true });
	escapeCase('large\u{fffd}', { selector: '#large\\110000', matched: true });
	escapeCase('large\u{fffd}', { selector: '#large\\23456a', matched: true });
	escapeCase('surrogate\u{fffd}', { selector: '#surrogate\\D800', matched: true });
	escapeCase('surrogate\u{fffd}', { selector: '#surrogate\\0DBAC', matched: true });
	escapeCase('\u{fffd}surrogate', { selector: '#\\00DFFFsurrogate', matched: true });
	escapeCase('\u{10ffff}', { selector: '#\\10fFfF', matched: true });
	escapeCase('\u{10ffff}0', { selector: '#\\10fFfF0', matched: true });
	escapeCase('\u{100000}00', { selector: '#\\10000000', matched: true });
	escapeCase('eof\u{fffd}', { selector: '#eof\\', matched: true });

	escapeCase('simple-ident', { selector: '#simple-ident', matched: true });
	escapeCase('testing123', { selector: '#testing123', matched: true });
	escapeCase('_underscore', { selector: '#_underscore', matched: true });
	escapeCase('-text', { selector: '#-text', matched: true });
	escapeCase('-m', { selector: '#-\\6d', matched: true });
	escapeCase('--abc', { selector: '#--abc', matched: true });
	escapeCase('--', { selector: '#--', matched: true });
	escapeCase('--11', { selector: '#--11', matched: true });
	escapeCase('---', { selector: '#---', matched: true });
	escapeCase('\u{2003}', { selector: '#\u{2003}', matched: true });
	escapeCase('\u{A0}', { selector: '#\u{A0}', matched: true });
	escapeCase('\u{1234}', { selector: '#\u{1234}', matched: true });
	escapeCase('\u{12345}', { selector: '#\u{12345}', matched: true });
	escapeCase('\u{fffd}', { selector: '#\u{0}', matched: true });
	escapeCase('ab\u{fffd}c', { selector: '#ab\u{0}c', matched: true });
}
