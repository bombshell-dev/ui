// Adapted from web-platform-tests at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. CSS escape cases by Domenic
// Denicola and bellbind; :has cases by Byungwoo Lee. BSD-3-Clause;
// see ../../../../test/wpt/LICENSE.txt. Original source paths are listed below.
import type { CompatibilityContext, DOMFixture } from '../../context.ts';
import type { DOMElement } from '../../contracts/nodes.ts';

function prepare(fixture: DOMFixture, markup: string): Document {
	const document = fixture.document as unknown as Document;
	const root = document.createElement('div');
	root.innerHTML = markup;
	fixture.connect(root as unknown as DOMElement);
	return document;
}

export const sourceFiles = [
	'dom/nodes/ParentNode-querySelector-All-multiple-not.html',
	'dom/nodes/ParentNode-querySelector-basic-has.html',
	'dom/nodes/ParentNode-querySelector-empty-attribute-value.html',
	'dom/nodes/ParentNode-querySelector-hyphen-prefix.html',
	'dom/nodes/ParentNode-querySelector-invalid-comment-like.html',
	'dom/nodes/ParentNode-querySelector-is-nested-pseudo-class.html',
	'dom/nodes/ParentNode-querySelector-is-not.html',
	'dom/nodes/ParentNode-querySelector-last-child-combinator.html',
	'dom/nodes/ParentNode-querySelector-matches.html',
	'dom/nodes/ParentNode-querySelector-nested-nth-child.html',
	'dom/nodes/ParentNode-querySelector-nested.html',
	'dom/nodes/ParentNode-querySelector-nth-of-type-complex.html',
	'dom/nodes/ParentNode-querySelectorAll-case-insensitive-attribute-flag.html',
	'dom/nodes/ParentNode-querySelectorAll-nested-not-has.html',
	'dom/nodes/ParentNode-querySelectorAll-not-descendant.html',
	'dom/nodes/ParentNode-querySelectors-space-and-dash-attribute-value.html',
	'dom/nodes/querySelector-empty-id.html',
	'dom/nodes/querySelector-id-nth-child.html',
	'dom/nodes/ParentNode-querySelector-escapes.html',
	'dom/nodes/querySelector-mixed-case.html',
	'css/selectors/is-where-basic.html',
	'css/selectors/has-basic.html',
] as const;

/** Registers every assertion from the listed pinned WPT selector regression files. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function arrayEquals(
		actual: ArrayLike<unknown>,
		options: { expected: ArrayLike<unknown>; message?: string },
	): void {
		expect(actual.length, options.message).toBe(options.expected.length);
		for (let i = 0; i < actual.length; i++)
			expect(actual[i], options.message).toBe(options.expected[i]);
	}
	function syntaxError(fixture: DOMFixture, operation: () => unknown): void {
		let caught: unknown;
		try {
			operation();
		} catch (error) {
			caught = error;
		}
		expect(caught).toBeInstanceOf(fixture.globals('DOMException'));
		expect(caught).toMatchObject({ name: 'SyntaxError', code: 12 });
	}

	context.test(
		'WPT ParentNode-querySelector-All-multiple-not.html: :not() with multiple selectors in the list',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3297 -->\n\n<div id="container">\n  <div id="container-inner-1"></div>\n  <div id="container-inner-2">\n    <p>Foo</p>\n    <button>Bar</button>\n  </div>\n</div>',
			);

			const container = document.getElementById('container')!;
			expect(container.querySelectorAll(':not(svg, svg *)').length).toBe(4);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-basic-has.html: Basic :has() support in querySelector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3506 -->\n\n<p id="p-with-span">\n  <span>123</span>\n</p>\n<p></p>',
			);

			const expectedP = document.getElementById('p-with-span')!;
			expect(document.querySelector('p:has(span)')!).toBe(expectedP);
		},
	);

	context.test(
		"WPT ParentNode-querySelector-empty-attribute-value.html: [title=''] matches element with empty title attribute",
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1163 -->\n\n<div id="container">\n  <div></div>\n  <div title="">has empty title</div>\n  <div title="yes">has non-empty title</div>\n</div>',
			);

			const container = document.getElementById('container')!;
			expect(container.querySelectorAll("div[title='']").length).toBe(1);
		},
	);

	context.test(
		"WPT ParentNode-querySelector-empty-attribute-value.html: Compound [title][title=''] matches element with empty title attribute",
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1163 -->\n\n<div id="container">\n  <div></div>\n  <div title="">has empty title</div>\n  <div title="yes">has non-empty title</div>\n</div>',
			);

			const container = document.getElementById('container')!;
			expect(container.querySelectorAll("div[title][title='']").length).toBe(1);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-hyphen-prefix.html: ID selector with hyphen-prefix followed by letters',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3620 -->\n\n<div id="-abc" class="-xyz"></div>',
			);

			const element = document.querySelector('#-abc')!;
			expect(element).not.toBe(null);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-hyphen-prefix.html: Class selector with hyphen-prefix followed by letters',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3620 -->\n\n<div id="-abc" class="-xyz"></div>',
			);

			const element = document.querySelector('.-xyz')!;
			expect(element).not.toBe(null);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-hyphen-prefix.html: ID selector with hyphen-prefix followed by numbers',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3620 -->\n\n<div id="-abc" class="-xyz"></div>',
			);

			syntaxError(fixture, () => {
				document.querySelector('#-123')!;
			});
		},
	);

	context.test(
		'WPT ParentNode-querySelector-hyphen-prefix.html: Class selector with hyphen-prefix followed by numbers',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3620 -->\n\n<div id="-abc" class="-xyz"></div>',
			);

			syntaxError(fixture, () => {
				document.querySelector('.-123')!;
			});
		},
	);

	context.test(
		'WPT ParentNode-querySelector-invalid-comment-like.html: querySelector throws SyntaxError for comment-like selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1214 -->',
			);

			const selector =
				' //MAIN MENU - (used to keep mobile menu options hidden) // #tncms-region-nav-main-nav-right-nav';

			syntaxError(fixture, () => document.querySelector(selector)!);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-invalid-comment-like.html: querySelectorAll throws SyntaxError for comment-like selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1214 -->',
			);

			const selector =
				' //MAIN MENU - (used to keep mobile menu options hidden) // #tncms-region-nav-main-nav-right-nav';

			syntaxError(fixture, () => document.querySelectorAll(selector));
		},
	);

	context.test(
		'WPT ParentNode-querySelector-invalid-comment-like.html: matches throws SyntaxError for comment-like selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1214 -->',
			);

			const selector =
				' //MAIN MENU - (used to keep mobile menu options hidden) // #tncms-region-nav-main-nav-right-nav';

			syntaxError(fixture, () => document.body.matches(selector));
		},
	);

	context.test(
		'WPT ParentNode-querySelector-is-nested-pseudo-class.html: Simple nested :is selector should match all inputs and buttons',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3432 -->\n\n<div id="container">\n  <button id="button1">Button 1</button>\n  <input id="input1" type="text">\n  <input id="input2" type="submit" value="Submit">\n  <button id="button2" type="submit">Button 2</button>\n  <button id="button3" disabled>Button 3</button>\n</div>',
			);

			const elements = document.querySelectorAll(':is(:is(input), button)');
			const elementIds = Array.from(elements).map((el) => el.id);

			const expectedIds = ['button1', 'input1', 'input2', 'button2', 'button3'];
			arrayEquals(elementIds, { expected: expectedIds });
		},
	);

	context.test(
		'WPT ParentNode-querySelector-is-nested-pseudo-class.html: Complex nested :is selector with attribute and :not selectors should work',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3432 -->\n\n<div id="container">\n  <button id="button1">Button 1</button>\n  <input id="input1" type="text">\n  <input id="input2" type="submit" value="Submit">\n  <button id="button2" type="submit">Button 2</button>\n  <button id="button3" disabled>Button 3</button>\n</div>',
			);

			const selector = ':is(:is(button, input)[type=submit], button:not([type])):not([disabled])';
			const elements = document.querySelectorAll(selector);
			const elementIds = Array.from(elements).map((el) => el.id);

			const expectedIds = ['button1', 'input2', 'button2'];
			arrayEquals(elementIds, { expected: expectedIds });
		},
	);

	context.test(
		'WPT ParentNode-querySelector-is-not.html: querySelector with :is():not() combined',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3686 -->',
			);

			expect(document.querySelector(':is([a],b):not(.c)')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,[b]):not(.c)')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,b):not(.c)')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,b):not([c])')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a):not([b],.c)')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,[b])')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,[b]):first-child')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is([b]):not(.c)')!, 'does not throw').toBe(null);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-last-child-combinator.html: div:last-child > span[title] should match',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/972 -->\n\n<div id="container">\n  <div><span title="title text">text</span></div>\n</div>',
			);

			const container = document.getElementById('container')!;
			const span = container.querySelector('div:last-child > span[title]')!;
			expect(span).not.toBe(null);
			expect(span.textContent).toBe('text');
		},
	);

	context.test(
		'WPT ParentNode-querySelector-matches.html: matches with ancestor ID and descendant type selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="main">\n  <p class="foo">Foo</p>\n  <p>Bar</p>\n</div>',
			);

			const el = document.querySelector('#main .foo')!;
			expect(el.matches('#main p')).toBe(true);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-matches.html: matches returns false for non-matching ID selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="main">\n  <p class="foo">Foo</p>\n  <p>Bar</p>\n</div>',
			);

			const el = document.querySelector('#main .foo')!;
			expect(el.matches('#nonexistent')).toBe(false);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-matches.html: matches with :not() pseudo-class',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="main">\n  <p class="foo">Foo</p>\n  <p>Bar</p>\n</div>',
			);

			const el = document.querySelector('#main p:not(.foo)')!;
			expect(el.matches('#main p:not(.foo)')).toBe(true);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-matches.html: matches with simple type selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="main">\n  <p class="foo">Foo</p>\n  <p>Bar</p>\n</div>',
			);

			const el = document.querySelector('#main .foo')!;
			expect(el.matches('p')).toBe(true);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-nested-nth-child.html: querySelector with nested :nth-child() without tag names',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3026 -->\n\n<main>\n  <div> <!-- :nth-child(1) of main -->\n    <div> <!-- :nth-child(1) of div -->\n      <p>\n        <a href="#" id="targetLink">link</a>\n      </p>\n    </div>\n  </div>\n</main>',
			);

			const selector = 'main > :nth-child(1) > :nth-child(1) a';
			const expectedLink = document.getElementById('targetLink')!;
			expect(document.querySelector(selector)!).toBe(expectedLink);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-nested.html: querySelector on multi-level query selecting',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/#3928 -->\n\n<div>\n  <span id="span1">Actions</span>\n  <ul>\n    <li>\n      <a href="/">\n        <span id="span2">Link</span>\n      </a>\n    </li>\n  </ul>\n</div>',
			);

			const target = document.getElementById('span2')!;
			const anchor = document.querySelector('a')!;
			const span = anchor.querySelector('span')!;
			expect(span).toBe(target);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-nth-of-type-complex.html: querySelector with complex :nth-of-type selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3057 -->\n\n<div class="team-wrap">\n  <p>Sibling to ensure div.clearfix is :nth-of-type(1) among divs</p>\n  <div class="clearfix"> <!-- :nth-of-type(1) -->\n    <table>\n      <tbody>\n        <tr><td>Row 1 Data</td></tr>\n        <tr> <!-- :nth-of-type(2) -->\n          <td>\n            <span class="u-hyphenate" id="targetElement">Target Text</span>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n  <div class="clearfix">\n    <!-- Another clearfix sibling -->\n  </div>\n</div>',
			);

			const selector = '.team-wrap .clearfix:nth-of-type(1) tr:nth-of-type(2) .u-hyphenate';
			const expectedElement = document.getElementById('targetElement')!;
			expect(document.querySelector(selector)!).toBe(expectedElement);
		},
	);

	context.test(
		"WPT ParentNode-querySelectorAll-case-insensitive-attribute-flag.html: Case-insensitive attribute selector with lowercase flag 'i' should work",
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="testContainer">\n  <div class="CasE">Test div with CasE class</div>\n</div>',
			);

			const elements = document.querySelectorAll('div[class=CasE i]');
			expect(elements.length, "Selector with lowercase 'i' flag should match the element").toBe(1);
		},
	);

	context.test(
		"WPT ParentNode-querySelectorAll-case-insensitive-attribute-flag.html: Case-insensitive attribute selector with uppercase flag 'I' should work",
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="testContainer">\n  <div class="CasE">Test div with CasE class</div>\n</div>',
			);

			const elements = document.querySelectorAll('div[class=CasE I]');
			expect(elements.length, "Selector with uppercase 'I' flag should match the element").toBe(1);
		},
	);

	context.test(
		'WPT ParentNode-querySelectorAll-nested-not-has.html: querySelectorAll with :not(:has(..))',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3774 -->\n\n<dl>\n  <dt class="a">A:</dt>\n  <dd class="a" id="dd-a">A</dd>\n  <dt class="b">B:</dt>\n  <dd class="b" id="dd-b">\n    B\n    <dl>\n      <dt class="c">C:</dt>\n      <dd class="c" id="dd-c">C</dd>\n      <dt class="d">D:</dt>\n      <dd class="d" id="dd-d">D</dd>\n    </dl>\n  </dd>\n  <dt class="e">E:</dt>\n  <dd class="e" id="dd-e">E</dd>\n</dl>',
			);

			const selector1 = 'dd:not(:has(dd))';
			const selector2 = 'dd:not(dd:has(dd))';
			const expectedElements = [
				document.getElementById('dd-a')!,
				document.getElementById('dd-c')!,
				document.getElementById('dd-d')!,
				document.getElementById('dd-e')!,
			];

			const result1 = document.querySelectorAll(selector1);
			arrayEquals(result1, { expected: expectedElements, message: selector1 });

			const result2 = document.querySelectorAll(selector2);
			arrayEquals(result2, { expected: expectedElements, message: selector2 });
		},
	);

	context.test(
		'WPT ParentNode-querySelectorAll-not-descendant.html: querySelectorAll with :not() pseudo-class and descendant selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3340 -->\n\n<div id="container">\n  <p id="p1">\n    <table>\n      <tbody>\n        <tr>\n          <td>\n            <p id="p2"></p>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </p>\n  <p id="p3"></p>\n</div>',
			);

			const container = document.getElementById('container')!;
			const result = container.querySelectorAll('p:not(table p)');

			// Browsers parse the invalid HTML `<p><table>...</table></p><p>`
			// such that the first <p> is closed before the <table>,
			// and the closing </p> tag creates a *new* empty <p> element after the table.
			// Thus, the query should match p#p1, the empty p after the table, and p#p3.
			const resultIDs = Array.from(result, (el) => el.id);
			arrayEquals(resultIDs, { expected: ['p1', '', 'p3'] });
		},
	);

	context.test(
		'WPT ParentNode-querySelectors-space-and-dash-attribute-value.html: querySelector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/2542 -->\n\n<a title="test with - dash and space" id="testme">Test One</a>',
			);

			const el = document.getElementById('testme')!;

			expect(document.querySelector("a[title='test with - dash and space']")!).toBe(el);
		},
	);

	context.test(
		'WPT ParentNode-querySelectors-space-and-dash-attribute-value.html: querySelectorAll',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/2542 -->\n\n<a title="test with - dash and space" id="testme">Test One</a>',
			);

			const el = document.getElementById('testme')!;

			arrayEquals(document.querySelectorAll("a[title='test with - dash and space']"), {
				expected: [el],
			});
		},
	);

	context.test(
		'WPT querySelector-empty-id.html: querySelector attribute matching empty id',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="root">\n  <div id=""></div>\n  <div id></div>\n  <div></div>\n</div>',
			);
			const root = document.getElementById('root')!;

			expect(root.querySelectorAll('[id]').length).toBe(2);
			expect(root.querySelectorAll("[id='']").length).toBe(2);
		},
	);

	context.test(
		'WPT querySelector-id-nth-child.html: querySelector matching #id + constant nth-child()',
		(fixture) => {
			const document = prepare(fixture, '<div>\n  <div id="target"></div>\n</div>');
			const target = document.getElementById('target')!;

			expect(document.querySelector('#target:nth-child(1)')!).toBe(target);
			expect(document.querySelector('#target:nth-child(4)')!).toBe(null);
		},
	);

	context.test(
		'WPT querySelector-id-nth-child.html: querySelectorAll matching #id + constant nth-child()',
		(fixture) => {
			const document = prepare(fixture, '<div>\n  <div id="target"></div>\n</div>');

			expect(document.querySelectorAll('#target:nth-child(1)').length).toBe(1);
			expect(document.querySelectorAll('#target:nth-child(4)').length).toBe(0);
		},
	);

	function escapeCase(id: string, options: { selector: string; matched: boolean }): void {
		const { selector, matched } = options;
		context.test(
			'WPT ParentNode-querySelector-escapes.html: ' +
				JSON.stringify(id) +
				(matched ? ' should match with ' : ' should never match with ') +
				JSON.stringify(selector),
			(fixture) => {
				const document = fixture.document as unknown as Document;
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

	context.test(
		'WPT querySelector-mixed-case.html: Mixed HTML/SVG/MathML tree with various mixed-case attributes',
		(fixture) => {
			const document = prepare(fixture, '<div id="test-container"></div>');
			const container = document.getElementById('test-container')!;
			function buildTestTree(): HTMLDivElement {
				// Build entire DOM tree structure first (without attributes)
				const html1 = document.createElement('div');
				html1.id = 'html1';

				const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg1.id = 'svg1';

				const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
				svg2.id = 'svg2';

				const svg3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				svg3.id = 'svg3';

				const html2 = document.createElement('div');
				html2.id = 'html2';

				const math1 = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
				math1.id = 'math1';

				const math2 = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi');
				math2.id = 'math2';

				const svg4 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg4.id = 'svg4';

				const svg5 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				svg5.id = 'svg5';

				const html3 = document.createElement('div');
				html3.id = 'html3';

				// Create foreignObject with HTML inside SVG (will go in svg1)
				const foreign1 = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
				foreign1.id = 'foreign1';

				const html4 = document.createElement('div');
				html4.id = 'html4';

				const html5 = document.createElement('span');
				html5.id = 'html5';

				// Create nested: HTML > SVG inside html2
				const svg6 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg6.id = 'svg6';

				const foreign2 = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
				foreign2.id = 'foreign2';

				const html6 = document.createElement('div');
				html6.id = 'html6';

				const svg7 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg7.id = 'svg7';

				const svg8 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				svg8.id = 'svg8';

				// Build tree structure
				svg2.appendChild(svg3);
				svg1.appendChild(svg2);

				// Add foreignObject with HTML to svg1
				html4.appendChild(html5);
				foreign1.appendChild(html4);
				svg1.appendChild(foreign1);

				html1.appendChild(svg1);

				math1.appendChild(math2);
				html2.appendChild(math1);

				// Add deeply nested SVG > foreignObject > HTML > SVG to html2
				svg7.appendChild(svg8);
				html6.appendChild(svg7);
				foreign2.appendChild(html6);
				svg6.appendChild(foreign2);
				html2.appendChild(svg6);

				html1.appendChild(html2);

				svg4.appendChild(svg5);

				// Create wrapper container for all trees
				const wrapper = document.createElement('div');
				wrapper.appendChild(html1);
				wrapper.appendChild(svg4);
				wrapper.appendChild(html3);

				// NOW set all attributes
				html1.setAttribute('viewBox', 'html-val');
				html1.setAttribute('dataIndex', '0');
				html1.setAttribute('testAttr', 'alpha');

				svg1.setAttribute('viewBox', 'svg-val');
				svg1.setAttribute('dataIndex', '1');
				svg1.setAttribute('testAttr', 'beta');

				svg2.setAttribute('mixedCase', 'foo');
				svg2.setAttribute('dataValue', 'first');

				svg3.setAttribute('innerAttr', 'found');

				html2.setAttribute('viewBox', 'nested');
				html2.setAttribute('mathVariant', 'bold');

				math1.setAttribute('mathVariant', 'italic');
				math1.setAttribute('displayStyle', 'true');

				math2.setAttribute('testIndex', '5');
				math2.setAttribute('dataValue', 'second');

				svg5.setAttribute('viewBox', 'rect-val');
				svg5.setAttribute('testIndex', '10');

				html3.setAttribute('MixedCase', 'bar');
				html3.setAttribute('TestIndex', '20');

				// Set attributes on foreignObject tree in svg1
				foreign1.setAttribute('foreignAttr', 'foreign-val');

				html4.setAttribute('ForeignHTML', 'inside-foreign');
				html4.setAttribute('DataType', 'html-in-svg');

				html5.setAttribute('NestedCase', 'span-val');

				// Set attributes on deeply nested tree in html2
				svg6.setAttribute('DeepSVG', 'middle-svg');
				svg6.setAttribute('CaseSensitive', 'nested');

				foreign2.setAttribute('SecondForeign', 'deep-foreign');

				html6.setAttribute('InnerHTML', 'deep-html');
				html6.setAttribute('DataType', 'nested');

				svg7.setAttribute('ReEnteredSVG', 'back-to-svg');

				svg8.setAttribute('DeepestAttr', 'circle-val');
				svg8.setAttribute('CaseSensitive', 'deepest');

				return wrapper;
			}
			function runTests(root: Element): void {
				// DOM tree structure with attributes:
				// <div id="test-container">
				//   <div id="html1" viewBox="html-val" dataIndex="0" testAttr="alpha">
				//     <svg id="svg1" viewBox="svg-val" dataIndex="1" testAttr="beta">
				//       <g id="svg2" mixedCase="foo" dataValue="first">
				//         <circle id="svg3" innerAttr="found">
				//       </g>
				//       <foreignObject id="foreign1" foreignAttr="foreign-val">
				//         <div id="html4" ForeignHTML="inside-foreign" DataType="html-in-svg">
				//           <span id="html5" NestedCase="span-val">
				//         </div>
				//       </foreignObject>
				//     </svg>
				//     <div id="html2" viewBox="nested" mathVariant="bold">
				//       <math id="math1" mathVariant="italic" displayStyle="true">
				//         <mi id="math2" testIndex="5" dataValue="second">
				//       </math>
				//       <svg id="svg6" DeepSVG="middle-svg" CaseSensitive="nested">
				//         <foreignObject id="foreign2" SecondForeign="deep-foreign">
				//           <div id="html6" InnerHTML="deep-html" DataType="nested">
				//             <svg id="svg7" ReEnteredSVG="back-to-svg">
				//               <circle id="svg8" DeepestAttr="circle-val" CaseSensitive="deepest">
				//             </svg>
				//           </div>
				//         </foreignObject>
				//       </svg>
				//     </div>
				//   </div>
				//   <svg id="svg4">
				//     <rect id="svg5" viewBox="rect-val" testIndex="10">
				//   </svg>
				//   <div id="html3" MixedCase="bar" TestIndex="20">
				// </div>

				// Test 1: viewBox with mixed case - HTML is case-insensitive, SVG is case-sensitive
				let results = root.querySelectorAll('[viewBox]');
				expect(results.length, '[viewBox] should match 2 HTML elements + 2 SVG elements').toBe(4);
				let ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'html2', 'svg1', 'svg5'],
					message: '[viewBox] should match correct elements',
				});

				// Test 2: viewbox lowercase - should only match HTML elements
				results = root.querySelectorAll('[viewbox]');
				expect(results.length, '[viewbox] should only match HTML elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'html2'],
					message: '[viewbox] should only match HTML divs',
				});

				// Test 3: VIEWBOX uppercase - should only match HTML elements
				results = root.querySelectorAll('[VIEWBOX]');
				expect(results.length, '[VIEWBOX] should only match HTML elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'html2'],
					message: '[VIEWBOX] should only match HTML divs',
				});

				// Test 4: mathVariant - HTML is case-insensitive, MathML is case-sensitive
				results = root.querySelectorAll('[mathVariant]');
				expect(results.length, '[mathVariant] should match HTML + MathML').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html2', 'math1'],
					message: '[mathVariant] should match correct elements',
				});

				// Test 5: mathvariant lowercase - should only match HTML
				results = root.querySelectorAll('[mathvariant]');
				expect(results.length, '[mathvariant] should only match HTML').toBe(1);
				expect(results[0]!.id, '[mathvariant] should match html2').toBe('html2');

				// Test 6: dataIndex exact case
				results = root.querySelectorAll('[dataIndex]');
				expect(results.length, '[dataIndex] should match HTML and SVG').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'svg1'],
					message: '[dataIndex] should match html1 and svg1',
				});

				// Test 7: dataindex lowercase - should only match HTML
				results = root.querySelectorAll('[dataindex]');
				expect(results.length, '[dataindex] should only match HTML').toBe(1);
				expect(results[0]!.id, '[dataindex] should match html1').toBe('html1');

				// Test 8: testIndex mixed case
				// HTML elements: selector lowercased → [testindex] → matches html3
				// SVG/MathML: selector used as-is → [testIndex] → matches math2, svg5 (case-sensitive)
				results = root.querySelectorAll('[testIndex]');
				expect(results.length, '[testIndex] should match 3 elements').toBe(3);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html3', 'math2', 'svg5'],
					message: '[testIndex] should match html3, math2, and svg5',
				});

				// Test 9: TestIndex with capital T
				// HTML elements: selector lowercased → [testindex] → matches html3
				// SVG/MathML: selector used as-is → [TestIndex] → no match (testIndex != TestIndex)
				results = root.querySelectorAll('[TestIndex]');
				expect(results.length, '[TestIndex] should only match HTML element').toBe(1);
				expect(results[0]!.id, '[TestIndex] should match html3').toBe('html3');

				// Test 10: testindex all lowercase
				// HTML elements: selector lowercased → [testindex] → matches html3
				// SVG/MathML: selector used as-is → [testindex] → no match (testIndex != testindex)
				results = root.querySelectorAll('[testindex]');
				expect(results.length, '[testindex] should only match HTML element').toBe(1);
				expect(results[0]!.id, '[testindex] should match html3').toBe('html3');

				// Test 11: mixedCase exact
				// HTML elements: selector lowercased → [mixedcase] → matches html3
				// SVG: selector used as-is → [mixedCase] → matches svg2 (case-sensitive)
				results = root.querySelectorAll('[mixedCase]');
				expect(results.length, '[mixedCase] should match 2 elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html3', 'svg2'],
					message: '[mixedCase] should match html3 and svg2',
				});

				// Test 12: MixedCase capital M
				// HTML elements: selector lowercased → [mixedcase] → matches html3
				// SVG: selector used as-is → [MixedCase] → no match (mixedCase != MixedCase)
				results = root.querySelectorAll('[MixedCase]');
				expect(results.length, '[MixedCase] should only match HTML element').toBe(1);
				expect(results[0]!.id, '[MixedCase] should match html3').toBe('html3');

				// Test 13: mixedcase all lowercase
				// HTML elements: selector lowercased → [mixedcase] → matches html3
				// SVG: selector used as-is → [mixedcase] → no match (mixedCase != mixedcase)
				results = root.querySelectorAll('[mixedcase]');
				expect(results.length, '[mixedcase] should only match HTML element').toBe(1);
				expect(results[0]!.id, '[mixedcase] should match html3').toBe('html3');

				// Test 14: testAttr exact case
				results = root.querySelectorAll('[testAttr]');
				expect(results.length, '[testAttr] should match HTML and SVG').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'svg1'],
					message: '[testAttr] should match html1 and svg1',
				});

				// Test 15: Attribute value matching with prefix
				results = root.querySelectorAll('[viewBox^="svg"]');
				expect(results.length, '[viewBox^="svg"] should match 1 SVG element').toBe(1);
				expect(results[0]!.id, '[viewBox^="svg"] should match svg1').toBe('svg1');

				// Test 16: Attribute value matching with exact match
				results = root.querySelectorAll('[dataIndex="0"]');
				expect(results.length, '[dataIndex="0"] should match 1 element').toBe(1);
				expect(results[0]!.id, '[dataIndex="0"] should match html1').toBe('html1');

				// Test 17: Nested element query
				results = root.querySelectorAll('[innerAttr]');
				expect(results.length, '[innerAttr] should match nested circle').toBe(1);
				expect(results[0]!.id, '[innerAttr] should match svg3').toBe('svg3');

				// Test 18: displayStyle on MathML
				results = root.querySelectorAll('[displayStyle]');
				expect(results.length, '[displayStyle] should match MathML').toBe(1);
				expect(results[0]!.id, '[displayStyle] should match math1').toBe('math1');

				// Test 19: displaystyle lowercase - should not match anything (no HTML element has it)
				results = root.querySelectorAll('[displaystyle]');
				expect(results.length, '[displaystyle] should not match anything').toBe(0);

				// Test 20: Case-sensitive value matching with 's' flag
				results = root.querySelectorAll('[testAttr="alpha" s]');
				expect(results.length, '[testAttr="alpha" s] should match 1 element').toBe(1);
				expect(results[0]!.id, '[testAttr="alpha" s] should match html1').toBe('html1');

				// Test 21: Case-insensitive value matching with 'i' flag
				results = root.querySelectorAll('[testAttr="ALPHA" i]');
				expect(results.length, '[testAttr="ALPHA" i] should match 1 element').toBe(1);
				expect(results[0]!.id, '[testAttr="ALPHA" i] should match html1').toBe('html1');

				// Test 22: ForeignHTML - HTML inside foreignObject should be case-insensitive
				results = root.querySelectorAll('[ForeignHTML]');
				expect(results.length, '[ForeignHTML] should match HTML in foreignObject').toBe(1);
				expect(results[0]!.id, '[ForeignHTML] should match html4').toBe('html4');

				// Test 23: foreignhtml lowercase - should match HTML element in foreignObject
				results = root.querySelectorAll('[foreignhtml]');
				expect(results.length, '[foreignhtml] should match HTML in foreignObject').toBe(1);
				expect(results[0]!.id, '[foreignhtml] should match html4').toBe('html4');

				// Test 24: DataType - should match both HTML elements (case-insensitive)
				results = root.querySelectorAll('[DataType]');
				expect(results.length, '[DataType] should match 2 HTML elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html4', 'html6'],
					message: '[DataType] should match html4 and html6',
				});

				// Test 25: datatype lowercase - should match both HTML elements
				results = root.querySelectorAll('[datatype]');
				expect(results.length, '[datatype] should match 2 HTML elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html4', 'html6'],
					message: '[datatype] should match html4 and html6',
				});

				// Test 26: CaseSensitive on SVG elements - case-sensitive
				results = root.querySelectorAll('[CaseSensitive]');
				expect(results.length, '[CaseSensitive] should match 2 SVG elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['svg6', 'svg8'],
					message: '[CaseSensitive] should match svg6, svg8',
				});

				// Test 27: casesensitive lowercase - should NOT match SVG elements
				results = root.querySelectorAll('[casesensitive]');
				expect(results.length, '[casesensitive] should not match SVG elements').toBe(0);

				// Test 28: NestedCase - HTML span inside foreignObject should be case-insensitive
				results = root.querySelectorAll('[NestedCase]');
				expect(results.length, '[NestedCase] should match HTML span in foreignObject').toBe(1);
				expect(results[0]!.id, '[NestedCase] should match html5').toBe('html5');

				// Test 29: nestedcase lowercase - should match HTML span
				results = root.querySelectorAll('[nestedcase]');
				expect(results.length, '[nestedcase] should match HTML span in foreignObject').toBe(1);
				expect(results[0]!.id, '[nestedcase] should match html5').toBe('html5');

				// Test 30: ReEnteredSVG - SVG inside HTML inside foreignObject should be case-sensitive
				results = root.querySelectorAll('[ReEnteredSVG]');
				expect(
					results.length,
					'[ReEnteredSVG] should match SVG nested in HTML in foreignObject',
				).toBe(1);
				expect(results[0]!.id, '[ReEnteredSVG] should match svg7').toBe('svg7');

				// Test 31: reenteredsvg lowercase - should NOT match (SVG is case-sensitive)
				results = root.querySelectorAll('[reenteredsvg]');
				expect(results.length, '[reenteredsvg] should not match SVG element').toBe(0);

				// Test 32: DeepestAttr - deeply nested SVG circle should be case-sensitive
				results = root.querySelectorAll('[DeepestAttr]');
				expect(results.length, '[DeepestAttr] should match deeply nested circle').toBe(1);
				expect(results[0]!.id, '[DeepestAttr] should match svg8').toBe('svg8');

				// Test 33: deepestattr lowercase - should NOT match
				results = root.querySelectorAll('[deepestattr]');
				expect(results.length, '[deepestattr] should not match SVG circle').toBe(0);

				// Test 34: foreignAttr on foreignObject element - case-sensitive
				results = root.querySelectorAll('[foreignAttr]');
				expect(results.length, '[foreignAttr] should match foreignObject').toBe(1);
				expect(results[0]!.id, '[foreignAttr] should match foreign1').toBe('foreign1');

				// Test 35: foreignattr lowercase - should NOT match foreignObject (SVG namespace)
				results = root.querySelectorAll('[foreignattr]');
				expect(results.length, '[foreignattr] should not match foreignObject').toBe(0);

				// Test 36: InnerHTML on HTML element inside foreignObject - case-insensitive
				results = root.querySelectorAll('[InnerHTML]');
				expect(results.length, '[InnerHTML] should match HTML in foreignObject').toBe(1);
				expect(results[0]!.id, '[InnerHTML] should match html6').toBe('html6');

				// Test 37: innerhtml lowercase - should match HTML in foreignObject
				results = root.querySelectorAll('[innerhtml]');
				expect(results.length, '[innerhtml] should match HTML in foreignObject').toBe(1);
				expect(results[0]!.id, '[innerhtml] should match html6').toBe('html6');

				// Test 38: DeepSVG on SVG element - case-sensitive
				results = root.querySelectorAll('[DeepSVG]');
				expect(results.length, '[DeepSVG] should match SVG element').toBe(1);
				expect(results[0]!.id, '[DeepSVG] should match svg6').toBe('svg6');

				// Test 39: deepsvg lowercase - should NOT match SVG
				results = root.querySelectorAll('[deepsvg]');
				expect(results.length, '[deepsvg] should not match SVG element').toBe(0);

				// Test 40: SecondForeign on foreignObject element - case-sensitive
				results = root.querySelectorAll('[SecondForeign]');
				expect(results.length, '[SecondForeign] should match foreignObject').toBe(1);
				expect(results[0]!.id, '[SecondForeign] should match foreign2').toBe('foreign2');

				// Test 41: secondforeign lowercase - should NOT match foreignObject
				results = root.querySelectorAll('[secondforeign]');
				expect(results.length, '[secondforeign] should not match foreignObject').toBe(0);
			}

			const tree = buildTestTree();

			// Test on disconnected tree first
			runTests(tree);

			// Now append to document and test again
			container.appendChild(tree);
			runTests(container);

			container.innerHTML = '';
		},
		['element.namespaces'],
	);

	context.test('WPT is-where-basic.html: :is() matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const actual = Array.from(main.querySelectorAll(':is()'));
		const expected: Element[] = [];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(#a) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const actual = Array.from(main.querySelectorAll(':is(#a)'));
		const expected: Element[] = [a];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(#a, #f) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':is(#a, #f)'));
		const expected: Element[] = [a, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test(
		'WPT is-where-basic.html: :is(#a, #c) :where(#a #d, #c #f) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const d = document.getElementById('d')!;
			const f = document.getElementById('f')!;
			const actual = Array.from(main.querySelectorAll(':is(#a, #c) :where(#a #d, #c #f)'));
			const expected: Element[] = [d, f];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT is-where-basic.html: #c > :is(#c > #f) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const f = document.getElementById('f')!;
			const actual = Array.from(main.querySelectorAll('#c > :is(#c > #f)'));
			const expected: Element[] = [f];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT is-where-basic.html: #c > :is(#b > #f) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const actual = Array.from(main.querySelectorAll('#c > :is(#b > #f)'));
			const expected: Element[] = [];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test('WPT is-where-basic.html: #a div:is(#d) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const d = document.getElementById('d')!;
		const actual = Array.from(main.querySelectorAll('#a div:is(#d)'));
		const expected: Element[] = [d];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(div) > div matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const d = document.getElementById('d')!;
		const e = document.getElementById('e')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':is(div) > div'));
		const expected: Element[] = [d, e, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(*) > div matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const d = document.getElementById('d')!;
		const b = document.getElementById('b')!;
		const e = document.getElementById('e')!;
		const c = document.getElementById('c')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':is(*) > div'));
		const expected: Element[] = [a, b, c, d, e, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(*) div matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const d = document.getElementById('d')!;
		const b = document.getElementById('b')!;
		const e = document.getElementById('e')!;
		const c = document.getElementById('c')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':is(*) div'));
		const expected: Element[] = [a, b, c, d, e, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test(
		'WPT is-where-basic.html: div > :where(#e, #f) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const e = document.getElementById('e')!;
			const f = document.getElementById('f')!;
			const actual = Array.from(main.querySelectorAll('div > :where(#e, #f)'));
			const expected: Element[] = [e, f];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test('WPT is-where-basic.html: div > :where(*) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const d = document.getElementById('d')!;
		const e = document.getElementById('e')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll('div > :where(*)'));
		const expected: Element[] = [d, e, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test(
		'WPT is-where-basic.html: :is(*) > :where(*) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const a = document.getElementById('a')!;
			const d = document.getElementById('d')!;
			const b = document.getElementById('b')!;
			const e = document.getElementById('e')!;
			const c = document.getElementById('c')!;
			const f = document.getElementById('f')!;
			const actual = Array.from(main.querySelectorAll(':is(*) > :where(*)'));
			const expected: Element[] = [a, b, c, d, e, f];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT is-where-basic.html: :is(#a + #b) + :is(#c) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const c = document.getElementById('c')!;
			const actual = Array.from(main.querySelectorAll(':is(#a + #b) + :is(#c)'));
			const expected: Element[] = [c];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT is-where-basic.html: :is(#a, #b) + div matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const b = document.getElementById('b')!;
			const c = document.getElementById('c')!;
			const actual = Array.from(main.querySelectorAll(':is(#a, #b) + div'));
			const expected: Element[] = [b, c];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test('WPT has-basic.html: :has(#a) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const actual = Array.from(main.querySelectorAll(':has(#a)'));
		const expected: Element[] = [];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT has-basic.html: :has(.ancestor) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const actual = Array.from(main.querySelectorAll(':has(.ancestor)'));
		const expected: Element[] = [a];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT has-basic.html: :has(.target) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const b = document.getElementById('b')!;
		const f = document.getElementById('f')!;
		const h = document.getElementById('h')!;
		const actual = Array.from(main.querySelectorAll(':has(.target)'));
		const expected: Element[] = [a, b, f, h];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT has-basic.html: :has(.descendant) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const b = document.getElementById('b')!;
		const c = document.getElementById('c')!;
		const f = document.getElementById('f')!;
		const h = document.getElementById('h')!;
		const j = document.getElementById('j')!;
		const actual = Array.from(main.querySelectorAll(':has(.descendant)'));
		const expected: Element[] = [a, b, c, f, h, j];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT has-basic.html: .parent:has(.target) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const b = document.getElementById('b')!;
		const f = document.getElementById('f')!;
		const h = document.getElementById('h')!;
		const actual = Array.from(main.querySelectorAll('.parent:has(.target)'));
		const expected: Element[] = [b, f, h];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test(
		'WPT has-basic.html: :has(.sibling ~ .target) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const a = document.getElementById('a')!;
			const b = document.getElementById('b')!;
			const actual = Array.from(main.querySelectorAll(':has(.sibling ~ .target)'));
			const expected: Element[] = [a, b];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT has-basic.html: .parent:has(.sibling ~ .target) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const b = document.getElementById('b')!;
			const actual = Array.from(main.querySelectorAll('.parent:has(.sibling ~ .target)'));
			const expected: Element[] = [b];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT has-basic.html: :has(:is(.target ~ .sibling .descendant)) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const a = document.getElementById('a')!;
			const h = document.getElementById('h')!;
			const j = document.getElementById('j')!;
			const actual = Array.from(main.querySelectorAll(':has(:is(.target ~ .sibling .descendant))'));
			const expected: Element[] = [a, h, j];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT has-basic.html: .parent:has(:is(.target ~ .sibling .descendant)) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const h = document.getElementById('h')!;
			const actual = Array.from(
				main.querySelectorAll('.parent:has(:is(.target ~ .sibling .descendant))'),
			);
			const expected: Element[] = [h];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT has-basic.html: .sibling:has(.descendant) ~ .target matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const e = document.getElementById('e')!;
			const actual = Array.from(main.querySelectorAll('.sibling:has(.descendant) ~ .target'));
			const expected: Element[] = [e];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test('WPT has-basic.html: :has(> .parent) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const actual = Array.from(main.querySelectorAll(':has(> .parent)'));
		const expected: Element[] = [a];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT has-basic.html: :has(> .target) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const b = document.getElementById('b')!;
		const f = document.getElementById('f')!;
		const h = document.getElementById('h')!;
		const actual = Array.from(main.querySelectorAll(':has(> .target)'));
		const expected: Element[] = [b, f, h];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test(
		'WPT has-basic.html: :has(> .parent, > .target) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const a = document.getElementById('a')!;
			const b = document.getElementById('b')!;
			const f = document.getElementById('f')!;
			const h = document.getElementById('h')!;
			const actual = Array.from(main.querySelectorAll(':has(> .parent, > .target)'));
			const expected: Element[] = [a, b, f, h];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test('WPT has-basic.html: :has(+ #h) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':has(+ #h)'));
		const expected: Element[] = [f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT has-basic.html: .parent:has(~ #h) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const b = document.getElementById('b')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll('.parent:has(~ #h)'));
		const expected: Element[] = [b, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test(
		'WPT has-basic.html: .sibling:has(.descendant) matches expected element',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const c = document.getElementById('c')!;
			expect(main.querySelector('.sibling:has(.descendant)')).toBe(c);
		},
	);

	context.test(
		'WPT has-basic.html: closest(.ancestor:has(.descendant)) returns expected element',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const h = document.getElementById('h')!;
			const k = document.getElementById('k')!;
			expect(k.closest('.ancestor:has(.descendant)')).toBe(h);
		},
	);

	context.test(
		'WPT has-basic.html: :has(.target ~ .sibling .descendant) matches expectedly',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const h = document.getElementById('h')!;
			expect(h.matches(':has(.target ~ .sibling .descendant)')).toBe(true);
		},
	);
}
