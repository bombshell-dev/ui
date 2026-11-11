import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';
import { createRangeEnvironment, testRanges } from '../common.js.ts';
import { installRangeFrame, type RangeTestFrame } from './Range-test-iframe.html.ts';

// Written by Aryeh Gregor <ayg@aryeh.name>
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	async function run(fixture: DOMFixture, i: number, phase: 'dom' | 'position'): Promise<void> {
		const { document, Node } = fixture;
		const environment = createRangeEnvironment(document, fixture, expect);
		const {
			nodeLength,
			furthestAncestor,
			nextNode,
			nextNodeDescendants,
			isContained,
			indexOf,
			isText,
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

		function myDeleteContents(range: any): any {
			// "If the context object's start and end are the same, abort this method."
			if (range.startContainer == range.endContainer && range.startOffset == range.endOffset) {
				return;
			}

			// "Let original start node, original start offset, original end node, and
			// original end offset be the context object's start and end nodes and
			// offsets, respectively."
			var originalStartNode = range.startContainer;
			var originalStartOffset = range.startOffset;
			var originalEndNode = range.endContainer;
			var originalEndOffset = range.endOffset;

			// "If original start node and original end node are the same, and they are
			// a Text, ProcessingInstruction, or Comment node, replace data with node
			// original start node, offset original start offset, count original end
			// offset minus original start offset, and data the empty string, and then
			// terminate these steps"
			if (
				originalStartNode == originalEndNode &&
				(isText(range.startContainer) ||
					range.startContainer.nodeType == Node.PROCESSING_INSTRUCTION_NODE ||
					range.startContainer.nodeType == Node.COMMENT_NODE)
			) {
				originalStartNode.deleteData(originalStartOffset, originalEndOffset - originalStartOffset);
				return;
			}

			// "Let nodes to remove be a list of all the Nodes that are contained in
			// the context object, in tree order, omitting any Node whose parent is
			// also contained in the context object."
			//
			// We rely on the fact that the contained nodes must lie in tree order
			// between the start node, and the end node's last descendant (inclusive).
			var nodesToRemove: any[] = [];
			var stop = nextNodeDescendants(range.endContainer);
			for (var node = range.startContainer; node != stop; node = nextNode(node)) {
				if (isContained(node, range) && !(node.parentNode && isContained(node.parentNode, range))) {
					nodesToRemove.push(node);
				}
			}

			// "If original start node is an ancestor container of original end node,
			// set new node to original start node and new offset to original start
			// offset."
			var newNode: any;
			var newOffset: any;
			if (
				originalStartNode == originalEndNode ||
				originalEndNode.compareDocumentPosition(originalStartNode) & Node.DOCUMENT_POSITION_CONTAINS
			) {
				newNode = originalStartNode;
				newOffset = originalStartOffset;
				// "Otherwise:"
			} else {
				// "Let reference node equal original start node."
				var referenceNode = originalStartNode;

				// "While reference node's parent is not null and is not an ancestor
				// container of original end node, set reference node to its parent."
				while (
					referenceNode.parentNode &&
					referenceNode.parentNode != originalEndNode &&
					!(
						originalEndNode.compareDocumentPosition(referenceNode.parentNode) &
						Node.DOCUMENT_POSITION_CONTAINS
					)
				) {
					referenceNode = referenceNode.parentNode;
				}

				// "Set new node to the parent of reference node, and new offset to one
				// plus the index of reference node."
				newNode = referenceNode.parentNode;
				newOffset = 1 + indexOf(referenceNode);
			}

			// "If original start node is a Text, ProcessingInstruction, or Comment node,
			// replace data with node original start node, offset original start offset,
			// count original start node's length minus original start offset, data the
			// empty start"
			if (
				isText(originalStartNode) ||
				originalStartNode.nodeType == Node.PROCESSING_INSTRUCTION_NODE ||
				originalStartNode.nodeType == Node.COMMENT_NODE
			) {
				originalStartNode.deleteData(
					originalStartOffset,
					nodeLength(originalStartNode) - originalStartOffset,
				);
			}

			// "For each node in nodes to remove, in order, remove node from its
			// parent."
			for (var i = 0; i < nodesToRemove.length; i++) {
				nodesToRemove[i].parentNode.removeChild(nodesToRemove[i]);
			}

			// "If original end node is a Text, ProcessingInstruction, or Comment node,
			// replace data with node original end node, offset 0, count original end
			// offset, and data the empty string."
			if (
				isText(originalEndNode) ||
				originalEndNode.nodeType == Node.PROCESSING_INSTRUCTION_NODE ||
				originalEndNode.nodeType == Node.COMMENT_NODE
			) {
				originalEndNode.deleteData(0, originalEndOffset);
			}

			// "Set the context object's start and end to (new node, new offset)."
			range.setStart(newNode, newOffset);
			range.setEnd(newNode, newOffset);
		}

		function testDeleteContents(i: any): any {
			restoreIframe(actualIframe, i);
			restoreIframe(expectedIframe, i);

			var actualRange = actualIframe.contentWindow.testRange;
			var expectedRange = expectedIframe.contentWindow.testRange;
			var actualRoots: any, expectedRoots: any;

			step('dom', function (): any {
				expect(
					actualIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for actual deleteContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated deleteContents()',
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

				actualRange.deleteContents();
				myDeleteContents(expectedRange);

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
					if (!actualRoots[j].isEqualNode(expectedRoots[j])) {
						var msg = j ? 'detached node #' + j : 'tree root';
						msg = 'Actual and expected mismatch for ' + msg + '.  ';

						// Find the specific error
						var actual = actualRoots[j];
						var expected = expectedRoots[j];

						while (actual && expected) {
							expect(actual.nodeType, msg + 'First difference: differing nodeType').toBe(
								expected.nodeType,
							);
							expect(actual.nodeName, msg + 'First difference: differing nodeName').toBe(
								expected.nodeName,
							);
							expect(
								actual.nodeValue,
								msg +
									'First difference: differing nodeValue (nodeName = "' +
									actual.nodeName +
									'")',
							).toBe(expected.nodeValue);
							expect(
								actual.childNodes.length,
								msg +
									'First difference: differing number of children (nodeName = "' +
									actual.nodeName +
									'")',
							).toBe(expected.childNodes.length);
							actual = nextNode(actual);
							expected = nextNode(expected);
						}

						expect.unreachable("DOMs were not equal but we couldn't figure out why");
					}

					if (j == 0) {
						// Clearly something is wrong if the node lists are different
						// lengths.  We want to report this only after we've already
						// checked the main tree for equality, though, so it doesn't
						// mask more interesting errors.
						expect(
							actualRoots.length,
							"Actual and expected DOMs were broken up into a different number of pieces by deleteContents() (this probably means you created or detached nodes when you weren't supposed to)",
						).toBe(expectedRoots.length);
					}
				}
			});

			step('position', function (): any {
				expect(
					actualIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for actual deleteContents()',
				).toBe(null);
				expect(
					expectedIframe.contentWindow.unexpectedException,
					'Unexpected exception thrown when setting up Range for simulated deleteContents()',
				).toBe(null);
				expect(typeof actualRange, 'typeof Range produced in actual iframe').toBe('object');
				expect(typeof expectedRange, 'typeof Range produced in expected iframe').toBe('object');
				expect(
					actualRoots[0].isEqualNode(expectedRoots[0]),
					'The resulting DOMs were not equal, so comparing positions makes no sense',
				).toBe(true);

				expect(
					actualRange.startContainer,
					'startContainer and endContainer must always be the same after deleteContents()',
				).toBe(actualRange.endContainer);
				expect(
					actualRange.startOffset,
					'startOffset and endOffset must always be the same after deleteContents()',
				).toBe(actualRange.endOffset);
				expect(
					expectedRange.startContainer,
					'Test bug!  Expected startContainer and endContainer must always be the same after deleteContents()',
				).toBe(expectedRange.endContainer);
				expect(
					expectedRange.startOffset,
					'Test bug!  Expected startOffset and endOffset must always be the same after deleteContents()',
				).toBe(expectedRange.endOffset);

				expect(actualRange.startOffset, 'Unexpected startOffset after deleteContents()').toBe(
					expectedRange.startOffset,
				);
				// How do we decide that the two nodes are equal, since they're in
				// different trees?  Since the DOMs are the same, it's enough to check
				// that the index in the parent is the same all the way up the tree.
				// But we can first cheat by just checking they're actually equal.
				expect(
					actualRange.startContainer.isEqualNode(expectedRange.startContainer),
					'Unexpected startContainer after deleteContents(), expected ' +
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
		testDeleteContents(i);
	}
	context.test('Detached Range', ({ document }) => {
		var range = document.createRange();
		range.detach();
		range.deleteContents();
	});
	for (let i = 0; i < testRanges.length; i++) {
		context.test(
			'Resulting DOM for range ' + i + ' ' + testRanges[i],
			(fixture) => run(fixture, i, 'dom'),
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>Range.deleteContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5").  Only that test will be run.  Then you can look at the resulting\niframe in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
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
						'<!doctype html>\n<title>Range.deleteContents() tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<p>To debug test failures, add a query parameter "subtest" with the test id (like\n"?subtest=5").  Only that test will be run.  Then you can look at the resulting\niframe in the DOM.\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
				},
			},
		);
	}
}
