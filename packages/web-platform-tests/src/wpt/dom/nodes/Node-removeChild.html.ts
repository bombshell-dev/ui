import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const description of ['the main document', 'a synthetic document']) {
		for (const [p, creator] of [
			['element', 'createElement'],
			['text', 'createTextNode'],
			['comment', 'createComment'],
		] as const) {
			context.test(
				'Passing a detached ' +
					p +
					' from ' +
					description +
					' to removeChild should not affect it.',
				({ document, DOMException }) => {
					let doc =
						description === 'the main document'
							? document
							: document.implementation.createHTMLDocument();
					let s = doc[creator]('a');
					expect(s.ownerDocument).toBe(doc);
					expect(function () {
						document.body.removeChild(s);
					}).toThrow(
						expect.objectContaining({
							name: 'NotFoundError',
							code: 8,
							constructor: DOMException,
						}),
					);
					expect(s.ownerDocument).toBe(doc);
				},
			);
			context.test(
				'Passing a non-detached ' +
					p +
					' from ' +
					description +
					' to removeChild should not affect it.',
				({ document, DOMException }) => {
					let doc =
						description === 'the main document'
							? document
							: document.implementation.createHTMLDocument();
					let s = doc[creator]('b');
					doc.documentElement.appendChild(s);
					expect(s.ownerDocument).toBe(doc);
					expect(function () {
						document.body.removeChild(s);
					}).toThrow(
						expect.objectContaining({
							name: 'NotFoundError',
							code: 8,
							constructor: DOMException,
						}),
					);
					expect(s.ownerDocument).toBe(doc);
				},
			);
		}
	}
}
