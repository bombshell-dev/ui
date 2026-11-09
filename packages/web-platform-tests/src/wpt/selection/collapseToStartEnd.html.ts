import type { CompatibilityContext } from '../../shared/context.ts';
import { testRanges, setupRangeTests, ownerDocument } from './common.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		"Must throw InvalidStateErr if the selection's range is null",
		({ document, DOMException }) => {
			const selection = document.getSelection()!;

			selection.removeAllRanges();
			expect(function () {
				selection.collapseToStart();
			}).toThrow(
				expect.objectContaining({
					name: 'InvalidStateError',
					code: 11,
					constructor: DOMException,
				}),
			);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<title>Selection.collapseTo(Start|End)() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
			},
		},
	);
	// These indices apply upstream's isSelectableNode predicate to both endpoints.
	for (const i of [
		0, 1, 2, 3, 4, 5, 6, 7, 14, 15, 16, 17, 18, 22, 23, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37,
		38, 39,
	]) {
		context.test(
			'Range ' + i + ' ' + testRanges[i] + ' collapseToStart()',
			({ document }) => {
				const selection = document.getSelection()!;

				const endpoints = setupRangeTests(document)[i]!;

				selection.removeAllRanges();

				var addedRange = ownerDocument(endpoints[0]).createRange();
				addedRange.setStart(endpoints[0], endpoints[1]);
				addedRange.setEnd(endpoints[2], endpoints[3]);
				selection.addRange(addedRange);

				// We don't penalize browsers here for mishandling addRange() and
				// adding a different range than we specified.  They fail addRange()
				// tests for that, and don't have to fail collapseToStart/End() tests
				// too.  They do fail if they throw unexpectedly, though.  I also fail
				// them if there's no range at all, because otherwise they could pass
				// all tests if addRange() always does nothing and collapseToStart()
				// always throws.
				expect(selection.rangeCount, 'Sanity check: rangeCount must equal 1 after addRange()').toBe(
					1,
				);

				var expectedEndpoint = [
					selection.getRangeAt(0).startContainer,
					selection.getRangeAt(0).startOffset,
				];

				selection.collapseToStart();

				expect(selection.rangeCount, 'selection.rangeCount must equal 1').toBe(1);
				expect(selection.focusNode, 'focusNode must equal the original start node').toBe(
					expectedEndpoint[0],
				);
				expect(selection.focusOffset, 'focusOffset must equal the original start offset').toBe(
					expectedEndpoint[1],
				);
				expect(selection.anchorNode, 'anchorNode must equal the original start node').toBe(
					expectedEndpoint[0],
				);
				expect(selection.anchorOffset, 'anchorOffset must equal the original start offset').toBe(
					expectedEndpoint[1],
				);
				expect(
					addedRange.startContainer,
					"collapseToStart() must not change the startContainer of the selection's original range",
				).toBe(endpoints[0]);
				expect(
					addedRange.startOffset,
					"collapseToStart() must not change the startOffset of the selection's original range",
				).toBe(endpoints[1]);
				expect(
					addedRange.endContainer,
					"collapseToStart() must not change the endContainer of the selection's original range",
				).toBe(endpoints[2]);
				expect(
					addedRange.endOffset,
					"collapseToStart() must not change the endOffset of the selection's original range",
				).toBe(endpoints[3]);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>Selection.collapseTo(Start|End)() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
				},
			},
		);
		context.test(
			'Range ' + i + ' ' + testRanges[i] + ' collapseToEnd()',
			({ document }) => {
				const selection = document.getSelection()!;

				const endpoints = setupRangeTests(document)[i]!;

				selection.removeAllRanges();

				var addedRange = ownerDocument(endpoints[0]).createRange();
				addedRange.setStart(endpoints[0], endpoints[1]);
				addedRange.setEnd(endpoints[2], endpoints[3]);
				selection.addRange(addedRange);

				// We don't penalize browsers here for mishandling addRange() and
				// adding a different range than we specified.  They fail addRange()
				// tests for that, and don't have to fail collapseToStart/End() tests
				// too.  They do fail if they throw unexpectedly, though.  I also fail
				// them if there's no range at all, because otherwise they could pass
				// all tests if addRange() always does nothing and collapseToStart()
				// always throws.
				expect(selection.rangeCount, 'Sanity check: rangeCount must equal 1 after addRange()').toBe(
					1,
				);

				var expectedEndpoint = [
					selection.getRangeAt(0).endContainer,
					selection.getRangeAt(0).endOffset,
				];

				selection.collapseToEnd();

				expect(selection.rangeCount, 'selection.rangeCount must equal 1').toBe(1);
				expect(selection.focusNode, 'focusNode must equal the original end node').toBe(
					expectedEndpoint[0],
				);
				expect(selection.focusOffset, 'focusOffset must equal the original end offset').toBe(
					expectedEndpoint[1],
				);
				expect(selection.anchorNode, 'anchorNode must equal the original end node').toBe(
					expectedEndpoint[0],
				);
				expect(selection.anchorOffset, 'anchorOffset must equal the original end offset').toBe(
					expectedEndpoint[1],
				);
				expect(
					addedRange.startContainer,
					"collapseToEnd() must not change the startContainer of the selection's original range",
				).toBe(endpoints[0]);
				expect(
					addedRange.startOffset,
					"collapseToEnd() must not change the startOffset of the selection's original range",
				).toBe(endpoints[1]);
				expect(
					addedRange.endContainer,
					"collapseToEnd() must not change the endContainer of the selection's original range",
				).toBe(endpoints[2]);
				expect(
					addedRange.endOffset,
					"collapseToEnd() must not change the endOffset of the selection's original range",
				).toBe(endpoints[3]);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>Selection.collapseTo(Start|End)() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
				},
			},
		);
	}
}
