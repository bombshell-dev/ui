import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#interface-attr';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'moves ownership only after validating attribute node attachment',
		({ document }) => {
			const first = document.createElement('div');
			const second = document.createElement('div');
			const attr = document.createAttribute('title');
			attr.value = 'one';
			first.setAttributeNode(attr);
			expect(() => second.setAttributeNode(attr)).toThrow(
				expect.objectContaining({ name: 'InUseAttributeError' }),
			);
			expect(attr.ownerElement).toBe(first);
			expect(second.attributes.length).toBe(0);
			const replacement = document.createAttribute('title');
			replacement.value = 'two';
			expect(first.setAttributeNode(replacement)).toBe(attr);
			expect(attr.ownerElement).toBeNull();
			expect(replacement.ownerElement).toBe(first);
			expect(first.removeAttributeNode(replacement)).toBe(replacement);
			expect(replacement.ownerElement).toBeNull();
		},
	);

	context.test('retains Attr identity on value changes and detaches replaced Attr', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		e.setAttribute('title', 'a');
		const a = e.getAttributeNode('title')!;
		e.setAttribute('title', 'b');
		expect(e.getAttributeNode('title')).toBe(a);
		expect(a.value).toBe('b');
		const replacement = document.createAttribute('title');
		replacement.value = 'c';
		expect(e.setAttributeNode(replacement)).toBe(a);
		expect(a.ownerElement).toBeNull();
		expect(replacement.ownerElement).toBe(e);
	});

	context.test('rejects attributes in use and removing absent attributes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div'),
			other = document.createElement('div'),
			a = document.createAttribute('x');
		e.setAttributeNode(a);
		expect(() => other.setAttributeNode(a)).toThrow(
			expect.objectContaining({ name: 'InUseAttributeError' }),
		);
		expect(() => other.removeAttributeNode(a)).toThrow(
			expect.objectContaining({ name: 'NotFoundError' }),
		);
		expect(a.ownerElement).toBe(e);
	});
}
