import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#interface-characterdata';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'keeps data identity and coerces standard writable string properties',
		({ document }) => {
			const text = document.createTextNode('A😀B');
			const parent = document.createElement('div');
			parent.appendChild(text);
			expect(text.length).toBe(4);
			// @ts-expect-error -- Verify the standard DOMString conversion at runtime.
			text.data = 123;
			expect(text.data).toBe('123');
			expect(parent.firstChild).toBe(text);
			expect(text.nodeValue).toBe('123');
			text.nodeValue = null;
			expect(text.data).toBe('');
			text.textContent = 'next';
			expect(text.data).toBe('next');
		},
	);

	context.test('keeps text and comment nodeValue and textContent synchronized', (fixture) => {
		const document = fixture.document as unknown as Document;
		for (const t of [document.createTextNode('x'), document.createComment('x')]) {
			expect(t.nodeValue).toBe('x');
			t.nodeValue = 'y';
			expect(t.data).toBe('y');
			t.textContent = 'z';
			expect(t.nodeValue).toBe('z');
			expect(t.length).toBe(1);
		}
	});

	context.test('converts null nodeValue to empty data', (fixture) => {
		const document = fixture.document as unknown as Document;
		const t = document.createTextNode('x');
		t.nodeValue = null;
		expect(t.data).toBe('');
		expect(t.length).toBe(0);
	});
}
