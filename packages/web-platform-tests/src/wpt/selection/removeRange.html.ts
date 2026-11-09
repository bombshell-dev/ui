import type { CompatibilityContext } from '../../shared/context.ts';
import { setupRangeTests, ownerDocument } from './common.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	// These indices apply upstream's isSelectableNode predicate to both endpoints.
	for (const index of [
		0, 1, 2, 3, 4, 5, 6, 7, 14, 15, 16, 17, 18, 22, 23, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37,
		38, 39,
	]) {
		context.test(
			'removeRange() with Range ' + index,
			({ document, DOMException }) => {
				const endpoints = setupRangeTests(document)[index]!;
				const getSelection = () => document.getSelection()!;

				var selection = getSelection();
				selection.removeAllRanges();
				var range = ownerDocument(endpoints[0]).createRange();
				range.setStart(endpoints[0], endpoints[1]);
				range.setEnd(endpoints[2], endpoints[3]);

				selection.addRange(range);
				expect(selection.rangeCount).toBe(1);
				selection.removeRange(range);
				expect(selection.rangeCount, 'Range should be correctly removed.').toBe(0);
				expect(selection.anchorNode).toBe(null);
				expect(selection.focusNode).toBe(null);

				selection.addRange(range);
				expect(selection.rangeCount).toBe(1);
				var equivalentRange = ownerDocument(endpoints[0]).createRange();
				equivalentRange.setStart(endpoints[0], endpoints[1]);
				equivalentRange.setEnd(endpoints[2], endpoints[3]);
				expect(function () {
					selection.removeRange(equivalentRange);
				}, 'Removing a different range should throw').toThrow(
					expect.objectContaining({
						name: 'NotFoundError',
						code: 8,
						constructor: DOMException,
					}),
				);
				expect(
					selection.rangeCount,
					'Equivalent Range should not remove the registered Range.',
				).toBe(1);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<title>Selection.removeRange tests</title>\n<body>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n</body>\n',
				},
			},
		);
	}
	context.test('removeRange() argument is non-optional Range', (fixture) => {
		const { document } = fixture;
		const getSelection = () => document.getSelection()!;
		const TypeError = fixture.TypeError;

		var selection = getSelection();
		expect(function () {
			selection.removeRange(null as unknown as Range);
		}).toThrow(expect.objectContaining({ constructor: TypeError }));
		expect(function () {
			selection.removeRange(selection as unknown as Range);
		}).toThrow(expect.objectContaining({ constructor: TypeError }));
	});
}
