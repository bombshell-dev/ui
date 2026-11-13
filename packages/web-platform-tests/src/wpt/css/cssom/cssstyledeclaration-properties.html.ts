// Author: Emilio Cobos Álvarez <emilio@crisal.io>, Mozilla.
import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'CSS Test: CSSStyleDeclaration properties are defined as WebIDL attributes, not using getOwnPropertyNames()',
		({ document, CSSStyleDeclaration }) => {
			const declaration = document.documentElement.style;
			expect(declaration instanceof CSSStyleDeclaration, 'Should be a CSStyleDeclaration').toBe(
				true,
			);
			expect('color' in declaration, 'Should support the color property').toBe(true);
			expect(
				declaration.hasOwnProperty('color'),
				"shouldn't have an own property for WebIDL attributes",
			).toBe(false);
		},
	);
}
