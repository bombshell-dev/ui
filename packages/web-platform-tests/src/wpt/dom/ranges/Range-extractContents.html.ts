import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';
import { createRangeEnvironment, testRanges } from '../common.js.ts';
import { installRangeFrame, type RangeTestFrame } from './Range-test-iframe.html.ts';

// Written by Aryeh Gregor <ayg@aryeh.name>
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const exceptionNames: Record<string, string> = {
		INDEX_SIZE_ERR: 'IndexSizeError',
		HIERARCHY_REQUEST_ERR: 'HierarchyRequestError',
		WRONG_DOCUMENT_ERR: 'WrongDocumentError',
		INVALID_CHARACTER_ERR: 'InvalidCharacterError',
		NO_MODIFICATION_ALLOWED_ERR: 'NoModificationAllowedError',
		NOT_FOUND_ERR: 'NotFoundError',
		NOT_SUPPORTED_ERR: 'NotSupportedError',
		INVALID_STATE_ERR: 'InvalidStateError',
		SYNTAX_ERR: 'SyntaxError',
		INVALID_NODE_TYPE_ERR: 'InvalidNodeTypeError',
	};
	async function run(
		fixture: DOMFixture,
		i: number,
		phase: 'dom' | 'position' | 'frag',
	): Promise<void> {
		const { document, Node } = fixture;
		const environment = createRangeEnvironment(document, fixture, expect);
		const { furthestAncestor, nextNode, indexOf, myExtractContents, assertNodesEqual } =
			environment;
		environment.testDiv.parentNode.removeChild(environment.testDiv);
		const actualIframe = document.createElement('iframe') as RangeTestFrame;
		actualIframe.style.display = 'none';

		document.body.appendChild(actualIframe);
		const expectedIframe = document.createElement('iframe') as RangeTestFrame;
		expectedIframe.style.display = 'none';

		document.body.appendChild(expectedIframe);
		const referenceDoc = document.implementation.createHTMLDocument('');
		referenceDoc.removeChild(referenceDoc.documentElement);
		await installRangeFrame(actualIframe, expect);
		referenceDoc.appendChild(actualIframe.contentDocument.documentElement.cloneNode(true));
		await installRangeFrame(expectedIframe, expect);
		// Replay prerequisite upstream steps; only the selected case reports its failure.
		function step(selected: string, callback: () => void): void {
			if (selected === phase) callback();
			else {
				try {
					callback();
				} catch {
					/* Upstream test.step records this in its own case. */
				}
			}
		}
		function restoreIframe(iframe: any, i: any): any {
			// Most of this function is designed to work around the fact that Opera
			// doesn't let you add a doctype to a document that no longer has one, in
			// any way I can figure out.  I eventually compromised on something that
			// will still let Opera pass most tests that don't actually involve
			// doctypes.
			while (
				iframe.contentDocument.firstChild &&
				iframe.contentDocument.firstChild.nodeType != Node.DOCUMENT_TYPE_NODE
			) {
				iframe.contentDocument.removeChild(iframe.contentDocument.firstChild);
			}

			while (
				iframe.contentDocument.lastChild &&
				iframe.contentDocument.lastChild.nodeType != Node.DOCUMENT_TYPE_NODE
			) {
				iframe.contentDocument.removeChild(iframe.contentDocument.lastChild);
			}

			if (!iframe.contentDocument.firstChild) {
				// This will throw an exception in Opera if we reach here, which is why
				// I try to avoid it.  It will never happen in a browser that obeys the
				// spec, so it's really just insurance.  I don't think it actually gets
				// hit by anything.
				iframe.contentDocument.appendChild(
					iframe.contentDocument.implementation.createDocumentType('html', '', ''),
				);
			}
			iframe.contentDocument.appendChild(referenceDoc.documentElement.cloneNode(true));
			iframe.contentWindow.setupRangeTests();
			iframe.contentWindow.testRangeInput = testRanges[i];
			iframe.contentWindow.run();
		}

		function testExtractContents(i: any): any {
			restoreIframe(actualIframe, i);
			restoreIframe(expectedIframe, i);

			var actualRange = actualIframe.contentWindow.testRange;
			var expectedRange = expectedIframe.contentWindow.testRange;
			var actualFrag: any, expectedFrag: any;
			var actualRoots: any, expectedRoots: any;

			step('dom', function (): any {
				expect(
					actualIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for actual extractContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated extractContents()',
				).toBe(null);
				expect(typeof actualRange, 'typeof Range produced in actual iframe').toBe('object');
				expect(typeof expectedRange, 'typeof Range produced in expected iframe').toBe('object');

				// Just to be pedantic, we'll test not only that the tree we're
				// modifying is the same in expected vs. actual, but also that all the
				// nodes originally in it were the same.  Typically some nodes will
				// become detached when the algorithm is run, but they still exist and
				// references can still be kept to them, so they should also remain the
				// same.
				//
				// We initialize the list to all nodes, and later on remove all the
				// ones which still have parents, since the parents will presumably be
				// tested for isEqualNode() and checking the children would be
				// redundant.
				var actualAllNodes: any[] = [];
				var node = furthestAncestor(actualRange.startContainer);
				do {
					actualAllNodes.push(node);
				} while ((node = nextNode(node)));

				var expectedAllNodes: any[] = [];
				var node = furthestAncestor(expectedRange.startContainer);
				do {
					expectedAllNodes.push(node);
				} while ((node = nextNode(node)));

				expectedFrag = myExtractContents(expectedRange);
				if (typeof expectedFrag == 'string') {
					expect(function (): any {
						actualRange.extractContents();
					}).toThrow(
						expect.objectContaining({
							name: exceptionNames[expectedFrag],
							code: actualIframe.contentWindow.DOMException[
								expectedFrag as keyof typeof actualIframe.contentWindow.DOMException
							],
							constructor: actualIframe.contentWindow.DOMException,
						}),
					);
				} else {
					actualFrag = actualRange.extractContents();
				}

				actualRoots = [];
				for (var j = 0; j < actualAllNodes.length; j++) {
					if (!actualAllNodes[j].parentNode) {
						actualRoots.push(actualAllNodes[j]);
					}
				}

				expectedRoots = [];
				for (var j = 0; j < expectedAllNodes.length; j++) {
					if (!expectedAllNodes[j].parentNode) {
						expectedRoots.push(expectedAllNodes[j]);
					}
				}

				for (var j = 0; j < actualRoots.length; j++) {
					assertNodesEqual(
						actualRoots[j],
						expectedRoots[j],
						j ? 'detached node #' + j : 'tree root',
					);

					if (j == 0) {
						// Clearly something is wrong if the node lists are different
						// lengths.  We want to report this only after we've already
						// checked the main tree for equality, though, so it doesn't
						// mask more interesting errors.
						expect(
							actualRoots.length,
							"Actual and expected DOMs were broken up into a different number of pieces by extractContents() (this probably means you created or detached nodes when you weren't supposed to)",
						).toBe(expectedRoots.length);
					}
				}
			});

			step('position', function (): any {
				expect(
					actualIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for actual extractContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated extractContents()',
				).toBe(null);
				expect(typeof actualRange, 'typeof Range produced in actual iframe').toBe('object');
				expect(typeof expectedRange, 'typeof Range produced in expected iframe').toBe('object');

				expect(
					actualRoots[0].isEqualNode(expectedRoots[0]),
					'The resulting DOMs were not equal, so comparing positions makes no sense',
				).toBe(true);

				if (typeof expectedFrag == 'string') {
					// It's no longer true that, e.g., startContainer and endContainer
					// must always be the same
					return;
				}
				expect(
					actualRange.startContainer,
					'startContainer and endContainer must always be the same after extractContents()',
				).toBe(actualRange.endContainer);
				expect(
					actualRange.startOffset,
					'startOffset and endOffset must always be the same after extractContents()',
				).toBe(actualRange.endOffset);
				expect(
					expectedRange.startContainer,
					'Test bug!  Expected startContainer and endContainer must always be the same after extractContents()',
				).toBe(expectedRange.endContainer);
				expect(
					expectedRange.startOffset,
					'Test bug!  Expected startOffset and endOffset must always be the same after extractContents()',
				).toBe(expectedRange.endOffset);

				expect(actualRange.startOffset, 'Unexpected startOffset after extractContents()').toBe(
					expectedRange.startOffset,
				);
				// How do we decide that the two nodes are equal, since they're in
				// different trees?  Since the DOMs are the same, it's enough to check
				// that the index in the parent is the same all the way up the tree.
				// But we can first cheat by just checking they're actually equal.
				expect(
					actualRange.startContainer.isEqualNode(expectedRange.startContainer),
					'Unexpected startContainer after extractContents(), expected ' +
						expectedRange.startContainer.nodeName.toLowerCase() +
						' but got ' +
						actualRange.startContainer.nodeName.toLowerCase(),
				).toBe(true);
				var currentActual: Node | null = actualRange.startContainer;
				var currentExpected: Node | null = expectedRange.startContainer;
				var actual = '';
				var expected = '';
				while (currentActual && currentExpected) {
					actual = indexOf(currentActual) + '-' + actual;
					expected = indexOf(currentExpected) + '-' + expected;

					currentActual = currentActual.parentNode;
					currentExpected = currentExpected.parentNode;
				}
				actual = actual.substr(0, actual.length - 1);
				expected = expected.substr(0, expected.length - 1);
				expect(
					actual,
					"startContainer superficially looks right but is actually the wrong node if you trace back its index in all its ancestors (I'm surprised this actually happened",
				).toBe(expected);
			});

			step('frag', function (): any {
				expect(
					actualIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for actual extractContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated extractContents()',
				).toBe(null);
				expect(typeof actualRange, 'typeof Range produced in actual iframe').toBe('object');
				expect(typeof expectedRange, 'typeof Range produced in expected iframe').toBe('object');

				if (typeof expectedFrag == 'string') {
					// Comparing makes no sense
					return;
				}
				assertNodesEqual(actualFrag, expectedFrag, 'returned fragment');
			});
		}
		testExtractContents(i);
	}
	context.test('Detached Range', ({ document }) => {
		var range = document.createRange();
		range.detach();
		{
			const actualArray = range.extractContents().childNodes;
			const expectedArray: never[] = [];
			expect(actualArray.length).toBe(expectedArray.length);
			for (let index = 0; index < expectedArray.length; index++)
				expect(actualArray[index]).toBe(expectedArray[index]);
		}
	});
	for (let i = 0; i < testRanges.length; i++) {
		context.test(
			'Resulting DOM for range ' + i + ' ' + testRanges[i],
			(fixture) => run(fixture, i, 'dom'),
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>Range.extractContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5").  Only that test will be run.  Then you can look at the resulting\niframe in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
				},
			},
		);
		context.test(
			'Resulting cursor position for range ' + i + ' ' + testRanges[i],
			(fixture) => run(fixture, i, 'position'),
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>Range.extractContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5").  Only that test will be run.  Then you can look at the resulting\niframe in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
				},
			},
		);
		context.test(
			'Returned fragment for range ' + i + ' ' + testRanges[i],
			(fixture) => run(fixture, i, 'frag'),
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>Range.extractContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5").  Only that test will be run.  Then you can look at the resulting\niframe in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
				},
			},
		);
	}
}
