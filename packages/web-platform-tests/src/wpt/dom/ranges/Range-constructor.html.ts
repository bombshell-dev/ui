import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Range constructor test', ({ document, Range }) => {
		var range = new Range();
		expect(range.startContainer, 'startContainer').toBe(document);
		expect(range.endContainer, 'endContainer').toBe(document);
		expect(range.startOffset, 'startOffset').toBe(0);
		expect(range.endOffset, 'endOffset').toBe(0);
		expect(range.collapsed, 'collapsed').toBe(true);
		expect(range.commonAncestorContainer, 'commonAncestorContainer').toBe(document);
	});
}
