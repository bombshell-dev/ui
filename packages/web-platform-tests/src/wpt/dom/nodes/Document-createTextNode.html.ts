import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const value of ['\u000b', 'a -- b', 'a-', '-b', null, undefined]) {
		context.test(`createTextNode(${String(value)})`, ({ document, Text, CharacterData, Node }) => {
			let c = document.createTextNode(value as unknown as string);
			let expected = String(value);
			expect(c instanceof Text).toBe(true);
			expect(c instanceof CharacterData).toBe(true);
			expect(c instanceof Node).toBe(true);
			expect(c.ownerDocument).toBe(document);
			expect(c.data, 'data').toBe(expected);
			expect(c.nodeValue, 'nodeValue').toBe(expected);
			expect(c.textContent, 'textContent').toBe(expected);
			expect(c.length).toBe(expected.length);
			expect(c.nodeType).toBe(3);
			expect(c.nodeName).toBe('#text');
			expect(c.hasChildNodes()).toBe(false);
			expect(c.childNodes.length).toBe(0);
			expect(c.firstChild).toBe(null);
			expect(c.lastChild).toBe(null);
		});
	}
}
