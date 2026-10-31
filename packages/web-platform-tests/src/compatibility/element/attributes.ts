import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#interface-element';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'updates attributes coherently with presence and string coercion',
		({ document }) => {
			const element = document.createElement('div');
			expect(element.getAttribute('title')).toBeNull();
			element.setAttribute('title', 'one');
			const attr = element.getAttributeNode('title');
			element.setAttribute('title', 'two');
			expect(element.getAttributeNode('title')).toBe(attr);
			expect(attr?.value).toBe('two');
			const node = document.createAttribute('count');
			// @ts-expect-error -- Verify the standard DOMString conversion at runtime.
			node.value = 42;
			element.setAttributeNode(node);
			expect(element.getAttribute('count')).toBe('42');
			expect(element.hasAttributes()).toBe(true);
			element.toggleAttribute('hidden', true);
			expect(element.hasAttribute('hidden')).toBe(true);
			element.toggleAttribute('hidden', false);
			expect(element.hasAttribute('hidden')).toBe(false);
			element.removeAttribute('title');
			expect(attr?.ownerElement).toBeNull();
		},
	);

	context.test(
		'distinguishes absent attributes from empty values and preserves order',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('div');
			expect(e.getAttribute('title')).toBeNull();
			e.setAttribute('A', '1');
			e.setAttribute('b', '2');
			e.setAttribute('a', '3');
			expect(e.getAttributeNames()).toEqual(['a', 'b']);
			expect(e.getAttribute('A')).toBe('3');
			e.removeAttribute('a');
			e.setAttribute('a', '');
			expect(e.getAttributeNames()).toEqual(['b', 'a']);
			expect(e.hasAttribute('a')).toBe(true);
		},
	);

	context.test('toggles presence with force and validates names', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		expect(e.toggleAttribute('x')).toBe(true);
		expect(e.getAttribute('x')).toBe('');
		expect(e.toggleAttribute('x', true)).toBe(true);
		expect(e.toggleAttribute('x', false)).toBe(false);
		expect(e.toggleAttribute('x', false)).toBe(false);
		expect(() => e.setAttribute('bad name', 'x')).toThrow(
			expect.objectContaining({ name: 'InvalidCharacterError' }),
		);
	});
}
