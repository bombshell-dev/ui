import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const method of ['matches'] as const) {
		for (const { namespace, name, selector, title } of [
			{
				namespace: '',
				name: 'element',
				selector: 'element',
				title: `empty string namespace, ${method}`,
			},
			{ namespace: 'urn:ns', name: 'h', selector: 'h', title: `has a namespace, ${method}` },
			{ namespace: 'urn:ns', name: 'h', selector: '*|h', title: `has a namespace, *|, ${method}` },
		]) {
			context.test(`WPT Element-matches-namespaced-elements.html: ${title}`, ({ document }) => {
				const element = document.createElementNS(namespace, name);
				expect(element[method](selector)).toBe(true);
			});
		}
	}
}
