import type { CompatibilityContext, CompatibilityTestOptions } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const options: CompatibilityTestOptions = {
		document: {
			contentType: 'text/html',
			content: `<!doctype html>
<meta charset="utf-8">
<link rel="help" href="https://dom.spec.whatwg.org/#interface-htmlcollection">
<link rel="help" href="https://webidl.spec.whatwg.org/#es-iterator">
<title>HTMLCollection @@iterator Test</title>
<p id="1"></p>
<p id="2"></p>
<p id="3"></p>
<p id="4"></p>
<p id="5"></p>`,
		},
	};

	context.test(
		'HTMLCollection has length method.',
		({ document }) => {
			const paragraphs = document.getElementsByTagName('p');
			expect('length' in paragraphs).toBe(true);
		},
		options,
	);

	context.test(
		"HTMLCollection does not have iterable's values method.",
		({ document }) => {
			const paragraphs = document.getElementsByTagName('p');
			expect('values' in paragraphs).toBe(false);
		},
		options,
	);

	context.test(
		"HTMLCollection does not have iterable's entries method.",
		({ document }) => {
			const paragraphs = document.getElementsByTagName('p');
			expect('entries' in paragraphs).toBe(false);
		},
		options,
	);

	context.test(
		"HTMLCollection does not have iterable's forEach method.",
		({ document }) => {
			const paragraphs = document.getElementsByTagName('p');
			expect('forEach' in paragraphs).toBe(false);
		},
		options,
	);

	context.test(
		'HTMLCollection has Symbol.iterator.',
		({ document }) => {
			const paragraphs = document.getElementsByTagName('p');
			expect(Symbol.iterator in paragraphs).toBe(true);
		},
		options,
	);

	context.test(
		'HTMLCollection is iterable via for-of loop.',
		({ document }) => {
			const paragraphs = document.getElementsByTagName('p');
			const ids = '12345';
			let idx = 0;
			for (const element of paragraphs) {
				expect(element.getAttribute('id')).toBe(ids[idx++]);
			}
		},
		options,
	);
}
