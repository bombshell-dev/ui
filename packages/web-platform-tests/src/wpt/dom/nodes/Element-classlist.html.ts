import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	const XHTML_NS = 'http://www.w3.org/1999/xhtml';
	const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';

	function setClass(e: Element, newVal: string | null) {
		if (newVal === null) {
			e.removeAttribute('class');
		} else {
			e.setAttribute('class', newVal);
		}
	}

	function checkModification(
		nodeIndex: number,
		funcName: 'add' | 'remove' | 'toggle' | 'replace',
		args: unknown,
		expectedRes: unknown,
		before: string | null,
		after: string | null,
		expectedException: string | undefined,
		desc: string,
	) {
		let e: Element;
		const argumentsList: unknown[] = Array.isArray(args) ? args : [args];

		context.test(
			'classList.' +
				funcName +
				'(' +
				argumentsList.map(String).join(', ') +
				') with attribute value ' +
				String(before) +
				desc,
			(fixture) => {
				const { document } = fixture;
				e = createNodes(document)[nodeIndex]!;
				const MutationObserver = fixture.MutationObserver;

				let res: unknown;
				let shouldThrow = typeof expectedException === 'string';
				if (shouldThrow) {
					// If an exception is thrown, the class attribute shouldn't change.
					after = before;
				}
				setClass(e, before);

				let obs: MutationObserver | undefined;
				// If we have MutationObservers available,  do some checks to make
				// sure attribute sets are happening at sane times.
				if (MutationObserver) {
					obs = new MutationObserver(() => {});
					obs.observe(e, { attributes: true });
				}
				if (shouldThrow) {
					expect(function () {
						let list = e.classList;
						res = Reflect.apply(list[funcName], list, argumentsList);
					}).toThrow(
						expect.objectContaining({
							name: expectedException,
							code: expectedException === 'SyntaxError' ? 12 : 5,
							constructor: fixture.DOMException,
						}),
					);
				} else {
					let list = e.classList;
					res = Reflect.apply(list[funcName], list, argumentsList);
				}
				if (obs) {
					let mutationRecords = obs.takeRecords();
					obs.disconnect();
					if (shouldThrow) {
						expect(mutationRecords.length, 'There should have been no mutation').toBe(0);
					} else if (funcName == 'replace') {
						expect(
							mutationRecords.length == 1,
							'Should have a mutation exactly when replace() returns true',
						).toBe(expectedRes);
					} else {
						// For other functions, would need to check when exactly
						// mutations are supposed to happen.
					}
				}
				if (!shouldThrow) {
					expect(res, 'wrong return value').toBe(expectedRes);
				}

				let expectedAfter = after;

				expect(e.getAttribute('class'), 'wrong class after modification').toBe(expectedAfter);
			},
			{
				document: { contentType: 'text/html', content: '<!doctype html><div id="content"></div>' },
			},
		);
	}

	function assignToClassListStrict(e: Element) {
		'use strict';
		(e as unknown as { classList: string }).classList = 'foo';
		e.removeAttribute('class');
	}

	function assignToClassList(e: Element) {
		let expected = e.classList;
		(e as unknown as { classList: string }).classList = 'foo';
		expect(e.classList, 'classList should be unchanged after assignment').toBe(expected);
		e.removeAttribute('class');
	}

	function testClassList(nodeIndex: number, desc: string) {
		let e: Element;

		// assignment

		context.test(
			'Assigning to classList' + desc,
			({ document }) => {
				e = createNodes(document)[nodeIndex]!;

				assignToClassListStrict(e);
				assignToClassList(e);
			},
			{
				document: { contentType: 'text/html', content: '<!doctype html><div id="content"></div>' },
			},
		);

		// supports
		context.test(
			'.supports() must throw TypeError' + desc,
			(fixture) => {
				const { document } = fixture;
				e = createNodes(document)[nodeIndex]!;
				const TypeError = fixture.TypeError;

				expect(function () {
					e.classList.supports('a');
				}).toThrow(expect.objectContaining({ constructor: TypeError }));
			},
			{
				document: { contentType: 'text/html', content: '<!doctype html><div id="content"></div>' },
			},
		);

		// length attribute

		function checkLength(value: string | null, length: number) {
			context.test(
				'classList.length when ' + (value === null ? 'removed' : 'set to ' + String(value)) + desc,
				({ document }) => {
					e = createNodes(document)[nodeIndex]!;

					setClass(e, value);
					expect(e.classList.length).toBe(length);
				},
				{
					document: {
						contentType: 'text/html',
						content: '<!doctype html><div id="content"></div>',
					},
				},
			);
		}

		checkLength(null, 0);
		checkLength('', 0);
		checkLength('   \t  \f', 0);
		checkLength('a', 1);
		checkLength('a A', 2);
		checkLength('\r\na\t\f', 1);
		checkLength('a a', 1);
		checkLength('a a a a a a', 1);
		checkLength('a a b b', 2);
		checkLength('a A B b', 4);
		checkLength('a b c c b a a b c c', 3);
		checkLength('   a  a b', 2);
		checkLength('a\tb\nc\fd\re f', 6);

		// [Stringifies]

		function checkStringifier(value: string | null, expected: string) {
			context.test(
				'classList.toString() when ' +
					(value === null ? 'removed' : 'set to ' + String(value)) +
					desc,
				({ document }) => {
					e = createNodes(document)[nodeIndex]!;

					setClass(e, value);
					expect(e.classList.toString()).toBe(expected);
				},
				{
					document: {
						contentType: 'text/html',
						content: '<!doctype html><div id="content"></div>',
					},
				},
			);
		}

		checkStringifier(null, '');
		checkStringifier('foo', 'foo');
		checkStringifier('   a  a b', '   a  a b');

		// item() method

		function checkItems(attributeValue: string | null, expectedValues: string[]) {
			function checkItemFunction(index: number, expected: string | null | undefined) {
				expect(e.classList.item(index), 'classList.item(' + index + ')').toBe(expected);
			}

			function checkItemArray(index: number, expected: string | undefined) {
				expect(e.classList[index], 'classList[' + index + ']').toBe(expected);
			}

			context.test(
				'classList.item() when set to ' + String(attributeValue) + desc,
				({ document }) => {
					e = createNodes(document)[nodeIndex]!;

					setClass(e, attributeValue);

					checkItemFunction(-1, null);
					checkItemArray(-1, undefined);

					let i = 0;
					while (i < expectedValues.length) {
						checkItemFunction(i, expectedValues[i]);
						checkItemArray(i, expectedValues[i]);
						i++;
					}

					checkItemFunction(i, null);
					checkItemArray(i, undefined);

					checkItemFunction(0xffffffff, null);
					checkItemArray(0xffffffff, undefined);

					checkItemFunction(0xfffffffe, null);
					checkItemArray(0xfffffffe, undefined);
				},
				{
					document: {
						contentType: 'text/html',
						content: '<!doctype html><div id="content"></div>',
					},
				},
			);
		}

		checkItems(null, []);
		checkItems('a', ['a']);
		checkItems('aa AA aa', ['aa', 'AA']);
		checkItems('a b', ['a', 'b']);
		checkItems('   a  a b', ['a', 'b']);
		checkItems('\t\n\f\r a\t\n\f\r b\t\n\f\r ', ['a', 'b']);

		// contains() method

		function checkContains(
			attributeValue: string | null,
			args: (string | null | undefined)[],
			expectedRes: boolean | boolean[],
		) {
			if (!Array.isArray(expectedRes)) {
				expectedRes = Array(args.length).fill(expectedRes);
			}

			for (let i = 0; i < args.length; i++) {
				context.test(
					'classList.contains(' +
						String(args[i]) +
						') when set to ' +
						String(attributeValue) +
						desc,
					({ document }) => {
						e = createNodes(document)[nodeIndex]!;

						setClass(e, attributeValue);
						expect(
							e.classList.contains(args[i] as string),
							'classList.contains("' + args[i] + '")',
						).toBe((expectedRes as boolean[])[i]);
					},
					{
						document: {
							contentType: 'text/html',
							content: '<!doctype html><div id="content"></div>',
						},
					},
				);
			}
		}

		checkContains(null, ['a', '', '  '], false);
		checkContains('', ['a'], false);

		checkContains('a', ['a'], true);
		checkContains('a', ['aa', 'b', 'A', 'a.', 'a)', , "a'", 'a"', 'a$', 'a~', 'a?', 'a\\'], false);

		// All "ASCII whitespace" per spec, before and after
		checkContains('a', ['a\t', '\ta', 'a\n', '\na', 'a\f', '\fa', 'a\r', '\ra', 'a ', ' a'], false);

		checkContains('aa AA', ['aa', 'AA', 'aA'], [true, true, false]);
		checkContains('a a a', ['a', 'aa', 'b'], [true, false, false]);
		checkContains('a b c', ['a', 'b'], true);

		checkContains('null undefined', [null, undefined], true);
		checkContains('\t\n\f\r a\t\n\f\r b\t\n\f\r ', ['a', 'b'], true);

		// add() method

		function checkAdd(
			before: string | null,
			argument: unknown,
			after: string | null,
			param?: string,
		) {
			let expectedException: string | undefined = undefined;
			let noop = false;
			if (param == 'noop') {
				noop = true;
			} else {
				expectedException = param;
			}
			checkModification(
				nodeIndex,
				'add',
				argument,
				undefined,
				before,
				after,
				expectedException,
				desc,
			);
			// Also check force toggle.  The only difference is that it doesn't run the
			// update steps for a no-op.
			if (!Array.isArray(argument)) {
				checkModification(
					nodeIndex,
					'toggle',
					[argument, true],
					true,
					before,
					noop ? before : after,
					expectedException,
					desc,
				);
			}
		}

		checkAdd(null, '', null, 'SyntaxError');
		checkAdd(null, ['a', ''], null, 'SyntaxError');
		checkAdd(null, ' ', null, 'InvalidCharacterError');
		checkAdd(null, '\ta', null, 'InvalidCharacterError');
		checkAdd(null, 'a\t', null, 'InvalidCharacterError');
		checkAdd(null, '\na', null, 'InvalidCharacterError');
		checkAdd(null, 'a\n', null, 'InvalidCharacterError');
		checkAdd(null, '\fa', null, 'InvalidCharacterError');
		checkAdd(null, 'a\f', null, 'InvalidCharacterError');
		checkAdd(null, '\ra', null, 'InvalidCharacterError');
		checkAdd(null, 'a\r', null, 'InvalidCharacterError');
		checkAdd(null, ' a', null, 'InvalidCharacterError');
		checkAdd(null, 'a ', null, 'InvalidCharacterError');
		checkAdd(null, ['a', ' '], null, 'InvalidCharacterError');
		checkAdd(null, ['a', 'aa '], null, 'InvalidCharacterError');

		checkAdd('a', 'a', 'a');
		checkAdd('aa', 'AA', 'aa AA');
		checkAdd('a b c', 'a', 'a b c');
		checkAdd('a a a  b', 'a', 'a b', 'noop');
		checkAdd(null, 'a', 'a');
		checkAdd('', 'a', 'a');
		checkAdd(' ', 'a', 'a');
		checkAdd('   \f', 'a', 'a');
		checkAdd('a', 'b', 'a b');
		checkAdd('a b c', 'd', 'a b c d');
		checkAdd('a b c ', 'd', 'a b c d');
		checkAdd('   a  a b', 'c', 'a b c');
		checkAdd('   a  a b', 'a', 'a b', 'noop');
		checkAdd('\t\n\f\r a\t\n\f\r b\t\n\f\r ', 'c', 'a b c');

		// multiple add
		checkAdd('a b c ', ['d', 'e'], 'a b c d e');
		checkAdd('a b c ', ['a', 'a'], 'a b c');
		checkAdd('a b c ', ['d', 'd'], 'a b c d');
		checkAdd('a b c a ', [], 'a b c');
		checkAdd(null, ['a', 'b'], 'a b');
		checkAdd('', ['a', 'b'], 'a b');

		checkAdd(null, null, 'null');
		checkAdd(null, undefined, 'undefined');

		// remove() method

		function checkRemove(
			before: string | null,
			argument: unknown,
			after: string | null,
			param?: string,
		) {
			let expectedException: string | undefined = undefined;
			let noop = false;
			if (param == 'noop') {
				noop = true;
			} else {
				expectedException = param;
			}
			checkModification(
				nodeIndex,
				'remove',
				argument,
				undefined,
				before,
				after,
				expectedException,
				desc,
			);
			// Also check force toggle.  The only difference is that it doesn't run the
			// update steps for a no-op.
			if (!Array.isArray(argument)) {
				checkModification(
					nodeIndex,
					'toggle',
					[argument, false],
					false,
					before,
					noop ? before : after,
					expectedException,
					desc,
				);
			}
		}

		checkRemove(null, '', null, 'SyntaxError');
		checkRemove(null, ' ', null, 'InvalidCharacterError');
		checkRemove('\ta', '\ta', '\ta', 'InvalidCharacterError');
		checkRemove('a\t', 'a\t', 'a\t', 'InvalidCharacterError');
		checkRemove('\na', '\na', '\na', 'InvalidCharacterError');
		checkRemove('a\n', 'a\n', 'a\n', 'InvalidCharacterError');
		checkRemove('\fa', '\fa', '\fa', 'InvalidCharacterError');
		checkRemove('a\f', 'a\f', 'a\f', 'InvalidCharacterError');
		checkRemove('\ra', '\ra', '\ra', 'InvalidCharacterError');
		checkRemove('a\r', 'a\r', 'a\r', 'InvalidCharacterError');
		checkRemove(' a', ' a', ' a', 'InvalidCharacterError');
		checkRemove('a ', 'a ', 'a ', 'InvalidCharacterError');
		checkRemove('aa ', 'aa ', null, 'InvalidCharacterError');

		checkRemove(null, 'a', null);
		checkRemove('', 'a', '');
		checkRemove('a b  c', 'd', 'a b c', 'noop');
		checkRemove('a b  c', 'A', 'a b c', 'noop');
		checkRemove(' a a a ', 'a', '');
		checkRemove('a  b', 'a', 'b');
		checkRemove('a  b  ', 'a', 'b');
		checkRemove('a a b', 'a', 'b');
		checkRemove('aa aa bb', 'aa', 'bb');
		checkRemove('a a b a a c a a', 'a', 'b c');

		checkRemove('a  b  c', 'b', 'a c');
		checkRemove('aaa  bbb  ccc', 'bbb', 'aaa ccc');
		checkRemove(' a  b  c ', 'b', 'a c');
		checkRemove('a b b b c', 'b', 'a c');

		checkRemove('a  b  c', 'c', 'a b');
		checkRemove(' a  b  c ', 'c', 'a b');
		checkRemove('a b c c c', 'c', 'a b');

		checkRemove('a b a c a d a', 'a', 'b c d');
		checkRemove('AA BB aa CC AA dd aa', 'AA', 'BB aa CC dd');

		checkRemove('\ra\na\ta\f', 'a', '');
		checkRemove('\t\n\f\r a\t\n\f\r b\t\n\f\r ', 'a', 'b');

		// multiple remove
		checkRemove('a b c ', ['d', 'e'], 'a b c');
		checkRemove('a b c ', ['a', 'b'], 'c');
		checkRemove('a b c ', ['a', 'c'], 'b');
		checkRemove('a b c ', ['a', 'a'], 'b c');
		checkRemove('a b c ', ['d', 'd'], 'a b c');
		checkRemove('a b c ', [], 'a b c');
		checkRemove(null, ['a', 'b'], null);
		checkRemove('', ['a', 'b'], '');
		checkRemove('a a', [], 'a');

		checkRemove('null', null, '');
		checkRemove('undefined', undefined, '');

		// toggle() method

		function checkToggle(
			before: string | null,
			argument: unknown,
			expectedRes: boolean | null,
			after: string | null,
			expectedException?: string,
		) {
			checkModification(
				nodeIndex,
				'toggle',
				argument,
				expectedRes,
				before,
				after,
				expectedException,
				desc,
			);
		}

		checkToggle(null, '', null, null, 'SyntaxError');
		checkToggle(null, 'aa ', null, null, 'InvalidCharacterError');

		checkToggle(null, 'a', true, 'a');
		checkToggle('', 'a', true, 'a');
		checkToggle(' ', 'a', true, 'a');
		checkToggle('   \f', 'a', true, 'a');
		checkToggle('a', 'b', true, 'a b');
		checkToggle('a', 'A', true, 'a A');
		checkToggle('a b c', 'd', true, 'a b c d');
		checkToggle('   a  a b', 'd', true, 'a b d');

		checkToggle('a', 'a', false, '');
		checkToggle(' a a a ', 'a', false, '');
		checkToggle(' A A A ', 'a', true, 'A a');
		checkToggle(' a b c ', 'b', false, 'a c');
		checkToggle(' a b c b b', 'b', false, 'a c');
		checkToggle(' a b  c  ', 'c', false, 'a b');
		checkToggle(' a b c ', 'a', false, 'b c');
		checkToggle('   a  a b', 'b', false, 'a');
		checkToggle('\t\n\f\r a\t\n\f\r b\t\n\f\r ', 'a', false, 'b');
		checkToggle('\t\n\f\r a\t\n\f\r b\t\n\f\r ', 'c', true, 'a b c');

		checkToggle('null', null, false, '');
		checkToggle('', null, true, 'null');
		checkToggle('undefined', undefined, false, '');
		checkToggle('', undefined, true, 'undefined');

		// replace() method
		function checkReplace(
			before: string | null,
			token: unknown,
			newToken: unknown,
			expectedRes: boolean | null,
			after: string | null,
			expectedException?: string,
		) {
			checkModification(
				nodeIndex,
				'replace',
				[token, newToken],
				expectedRes,
				before,
				after,
				expectedException,
				desc,
			);
		}

		checkReplace(null, '', 'a', null, null, 'SyntaxError');
		checkReplace(null, '', ' ', null, null, 'SyntaxError');
		checkReplace(null, ' ', 'a', null, null, 'InvalidCharacterError');
		checkReplace(null, '\ta', 'b', null, null, 'InvalidCharacterError');
		checkReplace(null, 'a\t', 'b', null, null, 'InvalidCharacterError');
		checkReplace(null, '\na', 'b', null, null, 'InvalidCharacterError');
		checkReplace(null, 'a\n', 'b', null, null, 'InvalidCharacterError');
		checkReplace(null, '\fa', 'b', null, null, 'InvalidCharacterError');
		checkReplace(null, 'a\f', 'b', null, null, 'InvalidCharacterError');
		checkReplace(null, '\ra', 'b', null, null, 'InvalidCharacterError');
		checkReplace(null, 'a\r', 'b', null, null, 'InvalidCharacterError');
		checkReplace(null, ' a', 'b', null, null, 'InvalidCharacterError');
		checkReplace(null, 'a ', 'b', null, null, 'InvalidCharacterError');

		checkReplace(null, 'a', '', null, null, 'SyntaxError');
		checkReplace(null, ' ', '', null, null, 'SyntaxError');
		checkReplace(null, 'a', ' ', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', '\ta', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', 'a\t', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', '\na', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', 'a\n', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', '\fa', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', 'a\f', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', '\ra', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', 'a\r', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', ' a', null, null, 'InvalidCharacterError');
		checkReplace(null, 'b', 'a ', null, null, 'InvalidCharacterError');

		checkReplace('a', 'a', 'a', true, 'a');
		checkReplace('a', 'a', 'b', true, 'b');
		checkReplace('a', 'A', 'b', false, 'a');
		checkReplace('a b', 'b', 'A', true, 'a A');
		checkReplace('a b', 'c', 'a', false, 'a b');
		checkReplace('a b c', 'd', 'e', false, 'a b c');
		// https://github.com/whatwg/dom/issues/443
		checkReplace('a a a  b', 'a', 'a', true, 'a b');
		checkReplace('a a a  b', 'c', 'd', false, 'a a a  b');
		checkReplace(null, 'a', 'b', false, null);
		checkReplace('', 'a', 'b', false, '');
		checkReplace(' ', 'a', 'b', false, ' ');
		checkReplace(' a  \f', 'a', 'b', true, 'b');
		checkReplace('a b c', 'b', 'd', true, 'a d c');
		checkReplace('a b c', 'c', 'a', true, 'a b');
		checkReplace('c b a', 'c', 'a', true, 'a b');
		checkReplace('a b a', 'a', 'c', true, 'c b');
		checkReplace('a b a', 'b', 'c', true, 'a c');
		checkReplace('   a  a b', 'a', 'c', true, 'c b');
		checkReplace('   a  a b', 'b', 'c', true, 'a c');
		checkReplace('\t\n\f\r a\t\n\f\r b\t\n\f\r ', 'a', 'c', true, 'c b');
		checkReplace('\t\n\f\r a\t\n\f\r b\t\n\f\r ', 'b', 'c', true, 'a c');

		checkReplace('a null', null, 'b', true, 'a b');
		checkReplace('a b', 'a', null, true, 'null b');
		checkReplace('a undefined', undefined, 'b', true, 'a b');
		checkReplace('a b', 'a', undefined, true, 'undefined b');
	}

	function createNodes(document: Document) {
		const content = document.getElementById('content')!;
		const htmlNode = document.createElement('div');
		content.appendChild(htmlNode);

		const xhtmlNode = document.createElementNS(XHTML_NS, 'div');
		content.appendChild(xhtmlNode);

		const mathMLNode = document.createElementNS(MATHML_NS, 'math');
		content.appendChild(mathMLNode);

		const xmlNode = document.createElementNS(null, 'foo');
		content.appendChild(xmlNode);

		const fooNode = document.createElementNS('http://example.org/foo', 'foo');
		content.appendChild(fooNode);

		return [htmlNode, xhtmlNode, mathMLNode, xmlNode, fooNode];
	}
	for (const [nodeIndex, desc] of [
		' (HTML node)',
		' (XHTML node)',
		' (MathML node)',
		' (XML node with null namespace)',
		' (foo node)',
	].entries()) {
		testClassList(nodeIndex, desc);
	}
}
