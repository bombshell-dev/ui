import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'removeAttribute should remove the first attribute, irrespective of namespace, when the first attribute is ' +
			'not in a namespace',
		({ document }) => {
			const el = document.createElement('p');
			el.setAttribute('x', 'first');
			el.setAttributeNS('foo', 'x', 'second');

			expect(el.attributes.length).toBe(2);
			expect(el.getAttribute('x')).toBe('first');
			expect(el.getAttributeNS(null, 'x')).toBe('first');
			expect(el.getAttributeNS('foo', 'x')).toBe('second');

			// removeAttribute removes the first attribute with name "x" that
			// we set on the element, irrespective of namespace.
			el.removeAttribute('x');

			// The only attribute remaining should be the second one.
			expect(el.getAttribute('x')).toBe('second');
			expect(el.getAttributeNS(null, 'x')).toBe(null);
			expect(el.getAttributeNS('foo', 'x')).toBe('second');
			expect(el.attributes.length, 'one attribute').toBe(1);
		},
	);

	context.test(
		'removeAttribute should remove the first attribute, irrespective of namespace, when the first attribute is ' +
			'in a namespace',
		({ document }) => {
			const el = document.createElement('p');
			el.setAttributeNS('foo', 'x', 'first');
			el.setAttributeNS('foo2', 'x', 'second');

			expect(el.attributes.length).toBe(2);
			expect(el.getAttribute('x')).toBe('first');
			expect(el.getAttributeNS('foo', 'x')).toBe('first');
			expect(el.getAttributeNS('foo2', 'x')).toBe('second');

			// removeAttribute removes the first attribute with name "x" that
			// we set on the element, irrespective of namespace.
			el.removeAttribute('x');

			// The only attribute remaining should be the second one.
			expect(el.getAttribute('x')).toBe('second');
			expect(el.getAttributeNS('foo', 'x')).toBe(null);
			expect(el.getAttributeNS('foo2', 'x')).toBe('second');
			expect(el.attributes.length, 'one attribute').toBe(1);
		},
	);
}
