import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	// Regression test for crbug.com/1138487.
	//
	// It was possible for a non-ASCII-lowercase string to be used when inserting
	// into the attribute collection if a hashtable encountered it during probing
	// while looking for the ASCII-lowercase equivalent.
	//
	// This caused such a string to be illegally used as an attribute name, thus
	// causing inconsistent behavior in future attribute lookup.
	context.test(
		'Attributes first seen in mixed ASCII case should not be corrupted.',
		({ document }) => {
			const el = document.createElement('div');
			el.setAttribute('labelXQL', 'abc');
			el.setAttribute('_valueXQL', 'def');
			expect(el.getAttribute('labelXQL')).toBe('abc');
			expect(el.getAttribute('labelxql')).toBe('abc');
			expect(el.getAttribute('_valueXQL')).toBe('def');
			expect(el.getAttribute('_valuexql')).toBe('def');
		},
	);
}
