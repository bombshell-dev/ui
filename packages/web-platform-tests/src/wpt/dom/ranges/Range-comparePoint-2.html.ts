import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('comparePoint after detach', ({ document }) => {
		var r = document.createRange();
		r.detach();
		expect(r.comparePoint(document.body, 0)).toBe(1);
	});
	context.test('comparePoint with null', ({ document, TypeError }) => {
		var r = document.createRange();
		expect(function () {
			r.comparePoint(null as unknown as Node, 0);
		}).toThrow(expect.objectContaining({ constructor: TypeError }));
	});
	context.test('comparePoint with another document', ({ document, DOMException }) => {
		var doc = document.implementation.createHTMLDocument('tralala');
		var r = document.createRange();
		expect(function () {
			r.comparePoint(doc.body, 0);
		}).toThrow(
			expect.objectContaining({
				name: 'WrongDocumentError',
				code: 4,
				constructor: DOMException,
			}),
		);
	});
}
