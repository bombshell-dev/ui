import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#interface-domtokenlist';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'maintains an ordered unique token set reflected in the class attribute',
		({ document }) => {
			const element = document.createElement('div');
			element.className = 'one two one';
			const list = element.classList;
			expect(Array.from(list)).toEqual(['one', 'two']);
			list.add('three', 'two');
			expect(element.getAttribute('class')).toBe('one two three');
			list.replace('one', 'three');
			expect(Array.from(list)).toEqual(['three', 'two']);
			expect(list.toggle('two', false)).toBe(false);
			expect(list.contains('two')).toBe(false);
			element.setAttribute('class', 'fresh');
			expect(list.item(0)).toBe('fresh');
			expect(() => list.add('bad token')).toThrow(
				expect.objectContaining({ name: 'InvalidCharacterError' }),
			);
		},
	);

	context.test('validates every token before multi-token mutation', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		e.className = 'a';
		for (const [token, name] of [
			['', 'SyntaxError'],
			['a b', 'InvalidCharacterError'],
		]) {
			expect(() => e.classList.add('b', token!)).toThrow(expect.objectContaining({ name }));
			expect(e.className).toBe('a');
		}
		expect(e.classList.item(99)).toBeNull();
	});

	context.test('preserves ordered uniqueness and replace semantics', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		e.className = 'a b a';
		const list = e.classList;
		expect(Array.from(list)).toEqual(['a', 'b']);
		expect(list.replace('missing', 'c')).toBe(false);
		expect(list.replace('a', 'b')).toBe(true);
		expect(Array.from(list)).toEqual(['b']);
		expect(list.toggle('b', true)).toBe(true);
		expect(list.toggle('b', false)).toBe(false);
		expect(list.length).toBe(0);
		expect(e.classList).toBe(list);
	});
}
