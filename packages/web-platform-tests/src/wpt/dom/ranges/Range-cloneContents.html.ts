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
		const {
			nodeLength,
			furthestAncestor,
			isAncestorContainer,
			nextNode,
			ownerDocument,
			isContained,
			isPartiallyContained,
			indexOf,
			isText,
			assertNodesEqual,
		} = environment;
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
		function myCloneContents(range: any): any {
			// "Let frag be a new DocumentFragment whose ownerDocument is the same as
			// the ownerDocument of the context object's start node."
			var ownerDoc =
				range.startContainer.nodeType == Node.DOCUMENT_NODE
					? range.startContainer
					: range.startContainer.ownerDocument;
			var frag = ownerDoc.createDocumentFragment();

			// "If the context object's start and end are the same, abort this method,
			// returning frag."
			if (range.startContainer == range.endContainer && range.startOffset == range.endOffset) {
				return frag;
			}

			// "Let original start node, original start offset, original end node, and
			// original end offset be the context object's start and end nodes and
			// offsets, respectively."
			var originalStartNode = range.startContainer;
			var originalStartOffset = range.startOffset;
			var originalEndNode = range.endContainer;
			var originalEndOffset = range.endOffset;

			// "If original start node and original end node are the same, and they are
			// a Text, ProcessingInstruction, or Comment node:"
			if (
				range.startContainer == range.endContainer &&
				(isText(range.startContainer) ||
					range.startContainer.nodeType == Node.COMMENT_NODE ||
					range.startContainer.nodeType == Node.PROCESSING_INSTRUCTION_NODE)
			) {
				// "Let clone be the result of calling cloneNode(false) on original
				// start node."
				var clone = originalStartNode.cloneNode(false);

				// "Set the data of clone to the result of calling
				// substringData(original start offset, original end offset − original
				// start offset) on original start node."
				clone.data = originalStartNode.substringData(
					originalStartOffset,
					originalEndOffset - originalStartOffset,
				);

				// "Append clone as the last child of frag."
				frag.appendChild(clone);

				// "Abort this method, returning frag."
				return frag;
			}

			// "Let common ancestor equal original start node."
			var commonAncestor = originalStartNode;

			// "While common ancestor is not an ancestor container of original end
			// node, set common ancestor to its own parent."
			while (!isAncestorContainer(commonAncestor, originalEndNode)) {
				commonAncestor = commonAncestor.parentNode;
			}

			// "If original start node is an ancestor container of original end node,
			// let first partially contained child be null."
			var firstPartiallyContainedChild: any;
			if (isAncestorContainer(originalStartNode, originalEndNode)) {
				firstPartiallyContainedChild = null;
				// "Otherwise, let first partially contained child be the first child of
				// common ancestor that is partially contained in the context object."
			} else {
				for (var i = 0; i < commonAncestor.childNodes.length; i++) {
					if (isPartiallyContained(commonAncestor.childNodes[i], range)) {
						firstPartiallyContainedChild = commonAncestor.childNodes[i];
						break;
					}
				}
				if (!firstPartiallyContainedChild) {
					throw 'Spec bug: no first partially contained child!';
				}
			}

			// "If original end node is an ancestor container of original start node,
			// let last partially contained child be null."
			var lastPartiallyContainedChild: any;
			if (isAncestorContainer(originalEndNode, originalStartNode)) {
				lastPartiallyContainedChild = null;
				// "Otherwise, let last partially contained child be the last child of
				// common ancestor that is partially contained in the context object."
			} else {
				for (var i = commonAncestor.childNodes.length - 1; i >= 0; i--) {
					if (isPartiallyContained(commonAncestor.childNodes[i], range)) {
						lastPartiallyContainedChild = commonAncestor.childNodes[i];
						break;
					}
				}
				if (!lastPartiallyContainedChild) {
					throw 'Spec bug: no last partially contained child!';
				}
			}

			// "Let contained children be a list of all children of common ancestor
			// that are contained in the context object, in tree order."
			//
			// "If any member of contained children is a DocumentType, raise a
			// HIERARCHY_REQUEST_ERR exception and abort these steps."
			var containedChildren: any[] = [];
			for (var i = 0; i < commonAncestor.childNodes.length; i++) {
				if (isContained(commonAncestor.childNodes[i], range)) {
					if (commonAncestor.childNodes[i].nodeType == Node.DOCUMENT_TYPE_NODE) {
						return 'HIERARCHY_REQUEST_ERR';
					}
					containedChildren.push(commonAncestor.childNodes[i]);
				}
			}

			// "If first partially contained child is a Text, ProcessingInstruction, or Comment node:"
			if (
				firstPartiallyContainedChild &&
				(isText(firstPartiallyContainedChild) ||
					firstPartiallyContainedChild.nodeType == Node.COMMENT_NODE ||
					firstPartiallyContainedChild.nodeType == Node.PROCESSING_INSTRUCTION_NODE)
			) {
				// "Let clone be the result of calling cloneNode(false) on original
				// start node."
				var clone = originalStartNode.cloneNode(false);

				// "Set the data of clone to the result of calling substringData() on
				// original start node, with original start offset as the first
				// argument and (length of original start node − original start offset)
				// as the second."
				clone.data = originalStartNode.substringData(
					originalStartOffset,
					nodeLength(originalStartNode) - originalStartOffset,
				);

				// "Append clone as the last child of frag."
				frag.appendChild(clone);
				// "Otherwise, if first partially contained child is not null:"
			} else if (firstPartiallyContainedChild) {
				// "Let clone be the result of calling cloneNode(false) on first
				// partially contained child."
				var clone = firstPartiallyContainedChild.cloneNode(false);

				// "Append clone as the last child of frag."
				frag.appendChild(clone);

				// "Let subrange be a new Range whose start is (original start node,
				// original start offset) and whose end is (first partially contained
				// child, length of first partially contained child)."
				var subrange = ownerDoc.createRange();
				subrange.setStart(originalStartNode, originalStartOffset);
				subrange.setEnd(firstPartiallyContainedChild, nodeLength(firstPartiallyContainedChild));

				// "Let subfrag be the result of calling cloneContents() on
				// subrange."
				var subfrag = myCloneContents(subrange);

				// "For each child of subfrag, in order, append that child to clone as
				// its last child."
				for (var i = 0; i < subfrag.childNodes.length; i++) {
					clone.appendChild(subfrag.childNodes[i]);
				}
			}

			// "For each contained child in contained children:"
			for (var i = 0; i < containedChildren.length; i++) {
				// "Let clone be the result of calling cloneNode(true) of contained
				// child."
				var clone = containedChildren[i].cloneNode(true);

				// "Append clone as the last child of frag."
				frag.appendChild(clone);
			}

			// "If last partially contained child is a Text, ProcessingInstruction, or Comment node:"
			if (
				lastPartiallyContainedChild &&
				(isText(lastPartiallyContainedChild) ||
					lastPartiallyContainedChild.nodeType == Node.COMMENT_NODE ||
					lastPartiallyContainedChild.nodeType == Node.PROCESSING_INSTRUCTION_NODE)
			) {
				// "Let clone be the result of calling cloneNode(false) on original
				// end node."
				var clone = originalEndNode.cloneNode(false);

				// "Set the data of clone to the result of calling substringData(0,
				// original end offset) on original end node."
				clone.data = originalEndNode.substringData(0, originalEndOffset);

				// "Append clone as the last child of frag."
				frag.appendChild(clone);
				// "Otherwise, if last partially contained child is not null:"
			} else if (lastPartiallyContainedChild) {
				// "Let clone be the result of calling cloneNode(false) on last
				// partially contained child."
				var clone = lastPartiallyContainedChild.cloneNode(false);

				// "Append clone as the last child of frag."
				frag.appendChild(clone);

				// "Let subrange be a new Range whose start is (last partially
				// contained child, 0) and whose end is (original end node, original
				// end offset)."
				var subrange = ownerDoc.createRange();
				subrange.setStart(lastPartiallyContainedChild, 0);
				subrange.setEnd(originalEndNode, originalEndOffset);

				// "Let subfrag be the result of calling cloneContents() on
				// subrange."
				var subfrag = myCloneContents(subrange);

				// "For each child of subfrag, in order, append that child to clone as
				// its last child."
				for (var i = 0; i < subfrag.childNodes.length; i++) {
					clone.appendChild(subfrag.childNodes[i]);
				}
			}

			// "Return frag."
			return frag;
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

		function testCloneContents(i: any): any {
			restoreIframe(actualIframe, i);
			restoreIframe(expectedIframe, i);

			var actualRange = actualIframe.contentWindow.testRange;
			var expectedRange = expectedIframe.contentWindow.testRange;
			var actualFrag: any, expectedFrag: any;
			var actualRoots: any, expectedRoots: any;

			step('dom', function (): any {
				expect(
					actualIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for actual cloneContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated cloneContents()',
				).toBe(null);
				expect(typeof actualRange, 'typeof Range produced in actual iframe').toBe('object');
				expect(typeof expectedRange, 'typeof Range produced in expected iframe').toBe('object');

				// NOTE: We could just assume that cloneContents() doesn't change
				// anything.  That would simplify these tests, taken in isolation.  But
				// once we've already set up the whole apparatus for extractContents()
				// and deleteContents(), we just reuse it here, on the theory of "why
				// not test some more stuff if it's easy to do".
				//
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

				expectedFrag = myCloneContents(expectedRange);
				if (typeof expectedFrag == 'string') {
					expect(function (): any {
						actualRange.cloneContents();
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
					actualFrag = actualRange.cloneContents();
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
							"Actual and expected DOMs were broken up into a different number of pieces by cloneContents() (this probably means you created or detached nodes when you weren't supposed to)",
						).toBe(expectedRoots.length);
					}
				}
			});

			step('position', function (): any {
				expect(
					actualIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for actual cloneContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated cloneContents()',
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

				expect(actualRange.startOffset, 'Unexpected startOffset after cloneContents()').toBe(
					expectedRange.startOffset,
				);
				// How do we decide that the two nodes are equal, since they're in
				// different trees?  Since the DOMs are the same, it's enough to check
				// that the index in the parent is the same all the way up the tree.
				// But we can first cheat by just checking they're actually equal.
				expect(
					actualRange.startContainer.isEqualNode(expectedRange.startContainer),
					'Unexpected startContainer after cloneContents(), expected ' +
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
					'Unexpected exception thrown when setting up Range for actual cloneContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated cloneContents()',
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
		testCloneContents(i);
	}
	context.test('Range.detach()', ({ document }) => {
		var range = document.createRange();
		range.detach();
		{
			const actualArray = range.cloneContents().childNodes;
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
						'<!doctype html>\n<title>Range.cloneContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5").  Only that test will be run.  Then you can look at the resulting\niframe in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
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
						'<!doctype html>\n<title>Range.cloneContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5").  Only that test will be run.  Then you can look at the resulting\niframe in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
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
						'<!doctype html>\n<title>Range.cloneContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5").  Only that test will be run.  Then you can look at the resulting\niframe in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
				},
			},
		);
	}
}
