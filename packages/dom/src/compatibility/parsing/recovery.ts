import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/parsing.html#tree-construction';
export const requires = ['parsing.fragments', 'document.parsing', 'templates.parsing'] as const;
const requiredGlobals = ['DOMParser'] as const;
export { requiredGlobals as globals };
// Adapted from WPT html/syntax/parsing/resources/{adoption01,tables01}.dat.
// Copyright © web-platform-tests contributors (BSD-3-Clause).
// Copyright (c) 2006-2013 James Graham, Geoffrey Sneddon, and other contributors (MIT).
// See ../../../test/wpt/{LICENSE,HTML5LIB-LICENSE}.txt and docs/wpt-ranges-parsing.md.
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/syntax/parsing/resources/adoption01.dat';

const recoveryCases = [
	{
		name: 'reconstructs formatting across misnested closing tags',
		markup: '<a>1<b>2</a>3</b>',
		expected: '<a>1<b>2</b></a><b>3</b>',
	},
	{
		name: 'splits formatting around a paragraph without losing reconstructed ancestry',
		markup: '<a><p></a></p>',
		expected: '<a></a><p><a></a></p>',
	},
	{
		name: 'preserves attributes when reconstructing multiple formatting elements',
		markup: '<p>1<s id="A">2<b id="B">3</p>4</s>5</b>',
		expected: '<p>1<s id="A">2<b id="B">3</b></s></p><s id="A"><b id="B">4</b></s><b id="B">5</b>',
	},
	{
		name: 'foster parents table text in order and inserts missing row containers',
		markup: '<table>A<td>B</td>C</table>',
		expected: 'AC<table><tbody><tr><td>B</td></tr></tbody></table>',
	},
	{
		name: 'foster parents a select and retains its option contents',
		markup: '<table><select><option>3</select></table>',
		expected: '<select><option>3</option></select><table></table>',
	},
	{
		name: 'closes a button and its table cell when a new cell begins',
		markup: '<table><td><button><td>',
		expected: '<table><tbody><tr><td><button></button></td><td></td></tr></tbody></table>',
	},
	{
		name: 'inserts colgroup and preserves attributes on implicitly grouped columns',
		markup: '<table><col foo="bar">',
		expected: '<table><colgroup><col foo="bar"></colgroup></table>',
	},
	{
		name: 'closes foreign content when a new cell starts at an HTML integration point',
		markup: '<table><tr><td><svg><desc><td>',
		expected: '<table><tbody><tr><td><svg><desc></desc></svg></td><td></td></tr></tbody></table>',
	},
] as const;

/** Registers malformed-markup tree construction cases across parsing entry points. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const { name, markup, expected } of recoveryCases) {
		context.test(name, (fixture) => {
			const document = fixture.document as unknown as Document;
			const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
			const fragment = document.createElement('div');
			fragment.innerHTML = markup;
			expect(fragment.innerHTML).toBe(expected);
			const parsed = new DOMParser().parseFromString(markup, 'text/html');
			expect(parsed.body.innerHTML).toBe(expected);
			// Serialization must be stable after reparsing the repaired tree.
			fragment.innerHTML = expected;
			expect(fragment.innerHTML).toBe(expected);
		});
	}
	context.test('keeps foster-parented nodes inside template content', (fixture) => {
		const document = fixture.document as unknown as Document;
		const root = document.createElement('div');
		root.innerHTML = '<template><table>A<td>B</td>C</table></template><i>outside</i>';
		const template = root.firstElementChild as HTMLTemplateElement;
		expect(template.innerHTML).toBe('AC<table><tbody><tr><td>B</td></tr></tbody></table>');
		expect(template.childNodes.length).toBe(0);
		expect(template.content.firstChild!.nodeValue).toBe('AC');
		expect(Array.from(root.children).map((node) => node.localName)).toEqual(['template', 'i']);
		expect(root.textContent).toBe('outside');
	});
	context.test(
		'reconstructs formatting independently inside nested template content',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const template = document.createElement('template');
			template.innerHTML = '<b>outer<template><a>1<b>2</a>3</b></template>end</b>';
			const nested = template.content.querySelector('template')!;
			expect(nested.innerHTML).toBe('<a>1<b>2</b></a><b>3</b>');
			expect(template.content.firstElementChild!.textContent).toBe('outerend');
			expect(nested.content.querySelector('b')!.ownerDocument).toBe(nested.content.ownerDocument);
		},
	);
}
