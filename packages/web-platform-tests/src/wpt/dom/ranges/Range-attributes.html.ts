import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Range attributes', ({ document }) => {
		var r = document.createRange();
		expect(r.startContainer).toBe(document);
		expect(r.endContainer).toBe(document);
		expect(r.startOffset).toBe(0);
		expect(r.endOffset).toBe(0);
		expect(r.collapsed).toBe(true);
		r.detach();
		expect(r.startContainer).toBe(document);
		expect(r.endContainer).toBe(document);
		expect(r.startOffset).toBe(0);
		expect(r.endOffset).toBe(0);
		expect(r.collapsed).toBe(true);
	});
}
