import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	// XXX

	// XXX

	context.test(
		'setAttribute should change the first attribute, irrespective of namespace',
		({ document }) => {
			const el = document.createElement('p');
			el.setAttributeNS('foo', 'x', 'first');
			el.setAttributeNS('foo2', 'x', 'second');

			el.setAttribute('x', 'changed');

			expect(el.attributes.length).toBe(2);
			expect(el.getAttribute('x')).toBe('changed');
			expect(el.getAttributeNS('foo', 'x')).toBe('changed');
			expect(el.getAttributeNS('foo2', 'x')).toBe('second');
		},
	);
	context.test('setAttribute should lowercase before setting', ({ document }) => {
		// https://github.com/whatwg/dom/issues/31

		const el = document.createElement('p');
		el.setAttribute('FOO', 'bar');

		expect(el.getAttribute('foo')).toBe('bar');
		expect(el.getAttribute('FOO')).toBe('bar');
		expect(el.getAttributeNS('', 'foo')).toBe('bar');
		expect(el.getAttributeNS('', 'FOO')).toBe(null);
	});
}
