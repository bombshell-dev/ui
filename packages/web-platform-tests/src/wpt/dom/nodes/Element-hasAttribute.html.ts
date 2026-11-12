import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'hasAttribute should check for attribute presence, irrespective of namespace',
		({ document }) => {
			const el = document.createElement('p');
			el.setAttributeNS('foo', 'x', 'first');

			expect(el.hasAttribute('x')).toBe(true);
		},
	);

	context.test(
		'hasAttribute should work with all attribute casings',
		({ document }) => {
			const el = document.getElementById('t')!;

			expect(el.hasAttribute('data-e2')).toBe(true);
			expect(el.hasAttribute('data-E2')).toBe(true);
			expect(el.hasAttribute('data-f2')).toBe(true);
			expect(el.hasAttribute('data-F2')).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!DOCTYPE html><span data-e2="2" data-F2="3" id="t"></span>',
			},
		},
	);
}
