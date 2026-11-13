// Author: Emilio Cobos Álvarez <emilio@crisal.io>.
import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"Setting an invalid property via the declaration setter doesn't create a declaration",
		({ document }) => {
			const element = document.createElement('div');
			element.style.setProperty('doesntexist', '0');
			expect(element.hasAttribute('style')).toBe(false);
		},
	);
	context.test(
		"Setting an invalid value via the declaration setter doesn't create a declaration",
		({ document }) => {
			const element = document.createElement('div');
			element.style.setProperty('width', '-100');
			expect(element.hasAttribute('style')).toBe(false);
		},
	);
}
