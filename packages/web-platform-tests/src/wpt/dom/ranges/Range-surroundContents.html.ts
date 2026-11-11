import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';
import { createRangeEnvironment, testRangesShort, testNodesShort } from '../common.js.ts';
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
		j: number,
		phase: 'dom' | 'position',
	): Promise<void> {
		const { document, Node } = fixture;
		const environment = createRangeEnvironment(document, fixture, expect);
		const {
			furthestAncestor,
			nextNode,
			nextNodeDescendants,
			isPartiallyContained,
			indexOf,
			myExtractContents,
			myInsertNode,
			isText,
			assertNodesEqual,
			getDomExceptionName,
		} = environment;
		environment.testDiv.parentNode.removeChild(environment.testDiv);
		const actualIframe = document.createElement('iframe') as RangeTestFrame;
		actualIframe.style.display = 'none';
		actualIframe.id = 'actual';
		document.body.appendChild(actualIframe);
		const expectedIframe = document.createElement('iframe') as RangeTestFrame;
		expectedIframe.style.display = 'none';
		expectedIframe.id = 'expected';
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
		function mySurroundContents(range: any, newParent: any): any {
			try {
				// "If a non-Text node is partially contained in the context object,
				// throw a "InvalidStateError" exception and terminate these steps."
				var node = range.commonAncestorContainer;
				var stop = nextNodeDescendants(node);
				for (; node != stop; node = nextNode(node)) {
					if (!isText(node) && isPartiallyContained(node, range)) {
						return 'INVALID_STATE_ERR';
					}
				}

				// "If newParent is a Document, DocumentType, or DocumentFragment node,
				// throw an "InvalidNodeTypeError" exception and terminate these
				// steps."
				if (
					newParent.nodeType == Node.DOCUMENT_NODE ||
					newParent.nodeType == Node.DOCUMENT_TYPE_NODE ||
					newParent.nodeType == Node.DOCUMENT_FRAGMENT_NODE
				) {
					return 'INVALID_NODE_TYPE_ERR';
				}

				// "Call extractContents() on the context object, and let fragment be
				// the result."
				var fragment = myExtractContents(range);
				if (typeof fragment == 'string') {
					return fragment;
				}

				// "While newParent has children, remove its first child."
				while (newParent.childNodes.length) {
					newParent.removeChild(newParent.firstChild);
				}

				// "Call insertNode(newParent) on the context object."
				var ret = myInsertNode(range, newParent);
				if (typeof ret == 'string') {
					return ret;
				}

				// "Call appendChild(fragment) on newParent."
				newParent.appendChild(fragment);

				// "Call selectNode(newParent) on the context object."
				//
				// We just reimplement this in-place.
				if (!newParent.parentNode) {
					return 'INVALID_NODE_TYPE_ERR';
				}
				var index = indexOf(newParent);
				range.setStart(newParent.parentNode, index);
				range.setEnd(newParent.parentNode, index + 1);
			} catch (e: any) {
				return getDomExceptionName(e);
			}
		}

		function restoreIframe(iframe: any, i: any, j: any): any {
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
			iframe.contentWindow.testRangeInput = testRangesShort[i];
			iframe.contentWindow.testNodeInput = testNodesShort[j];
			iframe.contentWindow.run();
		}

		function testSurroundContents(i: any, j: any): any {
			var actualRange: any;
			var expectedRange: any;
			var actualNode: any;
			var expectedNode: any;
			var actualRoots: any[] = [];
			var expectedRoots: any[] = [];

			step('dom', function (): any {
				restoreIframe(actualIframe, i, j);
				restoreIframe(expectedIframe, i, j);

				actualRange = actualIframe.contentWindow.testRange;
				expectedRange = expectedIframe.contentWindow.testRange;
				actualNode = actualIframe.contentWindow.testNode;
				expectedNode = expectedIframe.contentWindow.testNode;

				expect(
					actualIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for actual surroundContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated surroundContents()',
				).toBe(null);
				expect(typeof actualRange, 'typeof Range produced in actual iframe').toBe('object');
				expect(actualRange, 'Range produced in actual iframe was null').not.toBe(null);
				expect(typeof expectedRange, 'typeof Range produced in expected iframe').toBe('object');
				expect(expectedRange, 'Range produced in expected iframe was null').not.toBe(null);
				expect(typeof actualNode, 'typeof Node produced in actual iframe').toBe('object');
				expect(actualNode, 'Node produced in actual iframe was null').not.toBe(null);
				expect(typeof expectedNode, 'typeof Node produced in expected iframe').toBe('object');
				expect(expectedNode, 'Node produced in expected iframe was null').not.toBe(null);

				// We want to test that the trees containing the ranges are equal, and
				// also the trees containing the moved nodes.  These might not be the
				// same, if we're inserting a node from a detached tree or a different
				// document.
				actualRoots.push(furthestAncestor(actualRange.startContainer));
				expectedRoots.push(furthestAncestor(expectedRange.startContainer));

				if (furthestAncestor(actualNode) != actualRoots[0]) {
					actualRoots.push(furthestAncestor(actualNode));
				}
				if (furthestAncestor(expectedNode) != expectedRoots[0]) {
					expectedRoots.push(furthestAncestor(expectedNode));
				}

				expect(
					actualRoots.length,
					'Either the actual node and actual range are in the same tree but the expected are in different trees, or vice versa',
				).toBe(expectedRoots.length);

				// This doctype stuff is to work around the fact that Opera 11.00 will
				// move around doctypes within a document, even to totally invalid
				// positions, but it won't allow a new doctype to be added to a
				// document in any way I can figure out.  So if we try moving a doctype
				// to some invalid place, in Opera it will actually succeed, and then
				// restoreIframe() will remove the doctype along with the root element,
				// and then nothing can re-add the doctype.  So instead, we catch it
				// during the test itself and move it back to the right place while we
				// still can.
				//
				// I spent *way* too much time debugging and working around this bug.
				var actualDoctype = actualIframe.contentDocument.doctype!;
				var expectedDoctype = expectedIframe.contentDocument.doctype!;

				var result: any;
				try {
					result = mySurroundContents(expectedRange, expectedNode);
				} catch (e: any) {
					if (expectedDoctype != expectedIframe.contentDocument.firstChild) {
						expectedIframe.contentDocument.insertBefore(
							expectedDoctype,
							expectedIframe.contentDocument.firstChild,
						);
					}
					throw e;
				}
				if (typeof result == 'string') {
					expect(
						function (): any {
							try {
								actualRange.surroundContents(actualNode);
							} catch (e: any) {
								if (expectedDoctype != expectedIframe.contentDocument.firstChild) {
									expectedIframe.contentDocument.insertBefore(
										expectedDoctype,
										expectedIframe.contentDocument.firstChild,
									);
								}
								if (actualDoctype != actualIframe.contentDocument.firstChild) {
									actualIframe.contentDocument.insertBefore(
										actualDoctype,
										actualIframe.contentDocument.firstChild,
									);
								}
								throw e;
							}
						},
						'A ' + result + ' must be thrown in this case',
					).toThrow(
						expect.objectContaining({
							name: exceptionNames[result],
							code: actualIframe.contentWindow.DOMException[
								result as keyof typeof actualIframe.contentWindow.DOMException
							],
							constructor: actualIframe.contentWindow.DOMException,
						}),
					);
					// Don't return, we still need to test DOM equality
				} else {
					try {
						actualRange.surroundContents(actualNode);
					} catch (e: any) {
						if (expectedDoctype != expectedIframe.contentDocument.firstChild) {
							expectedIframe.contentDocument.insertBefore(
								expectedDoctype,
								expectedIframe.contentDocument.firstChild,
							);
						}
						if (actualDoctype != actualIframe.contentDocument.firstChild) {
							actualIframe.contentDocument.insertBefore(
								actualDoctype,
								actualIframe.contentDocument.firstChild,
							);
						}
						throw e;
					}
				}

				for (var k = 0; k < actualRoots.length; k++) {
					assertNodesEqual(
						actualRoots[k],
						expectedRoots[k],
						k ? "moved node's tree root" : "range's tree root",
					);
				}
			});

			step('position', function (): any {
				expect(
					actualIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for actual surroundContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated surroundContents()',
				).toBe(null);
				expect(typeof actualRange, 'typeof Range produced in actual iframe').toBe('object');
				expect(actualRange, 'Range produced in actual iframe was null').not.toBe(null);
				expect(typeof expectedRange, 'typeof Range produced in expected iframe').toBe('object');
				expect(expectedRange, 'Range produced in expected iframe was null').not.toBe(null);
				expect(typeof actualNode, 'typeof Node produced in actual iframe').toBe('object');
				expect(actualNode, 'Node produced in actual iframe was null').not.toBe(null);
				expect(typeof expectedNode, 'typeof Node produced in expected iframe').toBe('object');
				expect(expectedNode, 'Node produced in expected iframe was null').not.toBe(null);

				for (var k = 0; k < actualRoots.length; k++) {
					assertNodesEqual(
						actualRoots[k],
						expectedRoots[k],
						k ? "moved node's tree root" : "range's tree root",
					);
				}

				expect(actualRange.startOffset, 'Unexpected startOffset after surroundContents()').toBe(
					expectedRange.startOffset,
				);
				expect(actualRange.endOffset, 'Unexpected endOffset after surroundContents()').toBe(
					expectedRange.endOffset,
				);
				// How do we decide that the two nodes are equal, since they're in
				// different trees?  Since the DOMs are the same, it's enough to check
				// that the index in the parent is the same all the way up the tree.
				// But we can first cheat by just checking they're actually equal.
				expect(
					actualRange.startContainer.isEqualNode(expectedRange.startContainer),
					'Unexpected startContainer after surroundContents(), expected ' +
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
		}
		testSurroundContents(i, j);
	}
	for (let i = 0; i < testRangesShort.length; i++) {
		for (let j = 0; j < testNodesShort.length; j++) {
			context.test(
				i +
					',' +
					j +
					': resulting DOM for range ' +
					testRangesShort[i] +
					', node ' +
					testNodesShort[j],
				(fixture) => run(fixture, i, j, 'dom'),
				{
					document: {
						contentType: 'text/html',
						content:
							'<!doctype html>\n<meta charset=utf-8>\n<title>Range.surroundContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5,16").  Only that test will be run.  Then you can look at the resulting\niframes in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
					},
				},
			);
			context.test(
				i +
					',' +
					j +
					': resulting range position for range ' +
					testRangesShort[i] +
					', node ' +
					testNodesShort[j],
				(fixture) => run(fixture, i, j, 'position'),
				{
					document: {
						contentType: 'text/html',
						content:
							'<!doctype html>\n<meta charset=utf-8>\n<title>Range.surroundContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5,16").  Only that test will be run.  Then you can look at the resulting\niframes in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
					},
				},
			);
		}
	}
}
