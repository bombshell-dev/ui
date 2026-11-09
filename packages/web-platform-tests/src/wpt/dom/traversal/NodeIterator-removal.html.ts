import { restoreScriptNodes } from '../../../shared/restore-scripts.ts';
import type { CompatibilityContext } from '../../../shared/context.ts';
import { createNodes, nodeNames, previousNode, isInclusiveAncestor } from '../common.js.ts';

// Original script nodes remain part of the document traversed by these cases.
const scripts = [
	'<script src=/resources/testharness.js></script>',
	'<script src=/resources/testharnessreport.js></script>',
	'<script src=../common.js></script>',
	`<script>
"use strict";

for (var i = 0; i < testNodes.length; i++) {
  var node = eval(testNodes[i]);
  if (!node.parentNode) {
    // Nothing to test
    continue;
  }
  test(function() {
    var iters = [];
    var descs = [];
    var expectedReferenceNodes = [];
    var expectedPointers = [];

    for (var j = 0; j < testNodes.length; j++) {
      var root = eval(testNodes[j]);
      // Add all distinct iterators with this root, calling nextNode()
      // repeatedly until it winds up with the same iterator.
      for (var k = 0; ; k++) {
        var iter = document.createNodeIterator(root);
        for (var l = 0; l < k; l++) {
          iter.nextNode();
        }
        if (k && iter.referenceNode == iters[iters.length - 1].referenceNode
            && iter.pointerBeforeReferenceNode
               == iters[iters.length - 1].pointerBeforeReferenceNode) {
          break;
        } else {
          iters.push(iter);
          descs.push("document.createNodeIterator(" + testNodes[j]
            + ") advanced " + k + " times");
          expectedReferenceNodes.push(iter.referenceNode);
          expectedPointers.push(iter.pointerBeforeReferenceNode);

          var idx = iters.length - 1;

          // "If toBeRemovedNode is not an inclusive ancestor of nodeIterator's
          // reference, or toBeRemovedNode is an inclusive ancestor of
          // nodeIterator's root, then return."
          if (isInclusiveAncestor(node, root)
              || !isInclusiveAncestor(node, iter.referenceNode)) {
            continue;
          }

          // "If the pointerBeforeReferenceNode attribute value is false, set
          // the referenceNode attribute to the first node preceding the node
          // that is being removed, and terminate these steps."
          if (!iter.pointerBeforeReferenceNode) {
            expectedReferenceNodes[idx] = previousNode(node);
            continue;
          }

          // "If there is a node following the last inclusive descendant of the
          // node that is being removed, set the referenceNode attribute to the
          // first such node, and terminate these steps."
          var next = nextNodeDescendants(node);
          if (next) {
            expectedReferenceNodes[idx] = next;
            continue;
          }

          // "Set the referenceNode attribute to the first node preceding the
          // node that is being removed and set the pointerBeforeReferenceNode
          // attribute to false."
          expectedReferenceNodes[idx] = previousNode(node);
          expectedPointers[idx] = false;
        }
      }
    }

    var oldParent = node.parentNode;
    var oldSibling = node.nextSibling;
    oldParent.removeChild(node);

    for (var j = 0; j < iters.length; j++) {
      var iter = iters[j];
      assert_equals(iter.referenceNode, expectedReferenceNodes[j],
                    ".referenceNode of " + descs[j]);
      assert_equals(iter.pointerBeforeReferenceNode, expectedPointers[j],
                    ".pointerBeforeReferenceNode of " + descs[j]);
    }

    oldParent.insertBefore(node, oldSibling);
  }, "Test removing node " + testNodes[i]);
}

testDiv.style.display = "none";

// Targeted coverage for the pre-remove step that fires when
// pointerBeforeReferenceNode is true and the iterator's reference is inside
// the subtree being removed. The parametric loop above only drives iterators
// forward with nextNode(), so pointerBeforeReferenceNode is true only when
// referenceNode === root — a case the algorithm's first step now always
// short-circuits. To reach the "find next within root" branch we have to back
// the iterator up with previousNode() first.

const buildScratchTree = (structure) => {
  // structure is a string like "root[a[a1],b[b1],c]"; returns an object whose
  // keys are the named elements.
  const nodes = {};
  let i = 0;
  const parse = (parent) => {
    let name = "";
    while (i < structure.length && /[A-Za-z0-9]/.test(structure[i])) {
      name += structure[i++];
    }
    const el = document.createElement(name);
    nodes[name] = el;
    if (parent) parent.appendChild(el);
    if (structure[i] === "[") {
      i++;
      while (structure[i] !== "]") {
        parse(el);
        if (structure[i] === ",") i++;
      }
      i++;
    }
    return el;
  };
  const root = parse(null);
  document.body.appendChild(root);
  return { root, nodes };
};

test((t) => {
  // Tree: root[a[a1], b[b1], c]
  const { root, nodes } = buildScratchTree("root[a[a1],b[b1],c]");
  t.add_cleanup(() => root.remove());

  const iter = document.createNodeIterator(root);
  for (let i = 0; i < 5; i++) iter.nextNode();
  assert_equals(iter.referenceNode, nodes.b1, "advanced reference");
  assert_false(iter.pointerBeforeReferenceNode, "advanced pointer");
  iter.previousNode();
  assert_equals(iter.referenceNode, nodes.b1, "backed-up reference");
  assert_true(iter.pointerBeforeReferenceNode, "backed-up pointer");

  nodes.b.remove();

  // pre-remove step 2: next-within-root exists, so reference jumps to it and
  // pointer stays true.
  assert_equals(iter.referenceNode, nodes.c, "post-removal reference");
  assert_true(iter.pointerBeforeReferenceNode, "post-removal pointer");
}, "Removing an inclusive ancestor of reference, pointer before reference is true, "
   + "with a following node within root");

test((t) => {
  // Tree: root[a[a1], b[b1]] — no node after b within root.
  const { root, nodes } = buildScratchTree("root[a[a1],b[b1]]");
  t.add_cleanup(() => root.remove());

  const iter = document.createNodeIterator(root);
  for (let i = 0; i < 5; i++) iter.nextNode();
  assert_equals(iter.referenceNode, nodes.b1, "advanced reference");
  assert_false(iter.pointerBeforeReferenceNode, "advanced pointer");
  iter.previousNode();
  assert_equals(iter.referenceNode, nodes.b1, "backed-up reference");
  assert_true(iter.pointerBeforeReferenceNode, "backed-up pointer");

  nodes.b.remove();

  // pre-remove step 2: no next-within-root, so pointer flips to false and
  // step 3 moves reference to the last inclusive descendant of b's previous
  // sibling.
  assert_equals(iter.referenceNode, nodes.a1, "post-removal reference");
  assert_false(iter.pointerBeforeReferenceNode, "post-removal pointer");
}, "Removing an inclusive ancestor of reference, pointer before reference is true, "
   + "with no following node within root");
</script>`,
] as const;

// Written by Aryeh Gregor <ayg@aryeh.name>

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	/**
	 * Returns the last Node that's before node in tree order, or null if node is
	 * the first Node.
	 */

	/**
	 * Returns the next Node that's after node and all its descendants in tree
	 * order, or null if node is the last Node or an ancestor of it.
	 */
	function nextNodeDescendants(node: Node | null): Node | null {
		while (node && !node.nextSibling) {
			node = node.parentNode;
		}
		if (!node) {
			return null;
		}
		return node.nextSibling;
	}

	/**
	 * Returns true if ancestor is an inclusive ancestor of descendant, false
	 * otherwise.
	 */

	/**
	 * Returns true if descendant is a descendant of ancestor, false otherwise.
	 */

	/**
	 * Returns true if descendant is an inclusive descendant of ancestor, false
	 * otherwise.
	 */

	// Upstream skips nodes without parents in its fixture.
	for (const name of [
		'paras[0]',
		'paras[0].firstChild',
		'paras[1].firstChild',
		'paras[5].firstChild',
		'foreignPara1',
		'foreignPara1.firstChild',
		'detachedPara1',
		'detachedPara1.firstChild',
		'foreignPara2',
		'xmlElement',
		'foreignTextNode',
		'processingInstruction',
		'comment',
		'doctype',
		'foreignDoctype',
		'paras[1]',
		'detachedPara2',
		'detachedPara2.firstChild',
		'testDiv',
		'xmlTextNode',
		'xmlComment',
		'foreignComment',
		'xmlDoctype',
	] as const) {
		context.test(
			'Test removing node ' + name,
			(fixture) => {
				const { document } = fixture;
				restoreScriptNodes(document, scripts);
				const nodes = createNodes(fixture);
				const node = nodes[name];

				var iters: NodeIterator[] = [];
				var descs: string[] = [];
				var expectedReferenceNodes: (Node | null)[] = [];
				var expectedPointers: boolean[] = [];

				for (var j = 0; j < nodeNames.length; j++) {
					var root = nodes[nodeNames[j]!];
					// Add all distinct iterators with this root, calling nextNode()
					// repeatedly until it winds up with the same iterator.
					for (var k = 0; ; k++) {
						var iter = document.createNodeIterator(root);
						for (var l = 0; l < k; l++) {
							iter.nextNode();
						}
						if (
							k &&
							iter.referenceNode == iters[iters.length - 1]!.referenceNode &&
							iter.pointerBeforeReferenceNode == iters[iters.length - 1]!.pointerBeforeReferenceNode
						) {
							break;
						} else {
							iters.push(iter);
							descs.push(
								'document.createNodeIterator(' + nodeNames[j] + ') advanced ' + k + ' times',
							);
							expectedReferenceNodes.push(iter.referenceNode);
							expectedPointers.push(iter.pointerBeforeReferenceNode);

							var idx = iters.length - 1;

							// "If toBeRemovedNode is not an inclusive ancestor of nodeIterator's
							// reference, or toBeRemovedNode is an inclusive ancestor of
							// nodeIterator's root, then return."
							if (
								isInclusiveAncestor(node, root) ||
								!isInclusiveAncestor(node, iter.referenceNode)
							) {
								continue;
							}

							// "If the pointerBeforeReferenceNode attribute value is false, set
							// the referenceNode attribute to the first node preceding the node
							// that is being removed, and terminate these steps."
							if (!iter.pointerBeforeReferenceNode) {
								expectedReferenceNodes[idx] = previousNode(node);
								continue;
							}

							// "If there is a node following the last inclusive descendant of the
							// node that is being removed, set the referenceNode attribute to the
							// first such node, and terminate these steps."
							var next = nextNodeDescendants(node);
							if (next) {
								expectedReferenceNodes[idx] = next;
								continue;
							}

							// "Set the referenceNode attribute to the first node preceding the
							// node that is being removed and set the pointerBeforeReferenceNode
							// attribute to false."
							expectedReferenceNodes[idx] = previousNode(node);
							expectedPointers[idx] = false;
						}
					}
				}

				var oldParent = node.parentNode!;
				var oldSibling = node.nextSibling;
				oldParent.removeChild(node);

				for (var j = 0; j < iters.length; j++) {
					var iter = iters[j]!;
					expect(iter.referenceNode, '.referenceNode of ' + descs[j]).toBe(
						expectedReferenceNodes[j],
					);
					expect(
						iter.pointerBeforeReferenceNode,
						'.pointerBeforeReferenceNode of ' + descs[j],
					).toBe(expectedPointers[j]);
				}

				oldParent.insertBefore(node, oldSibling);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>NodeIterator removal tests</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>',
				},
			},
		);
	}

	const buildScratchTree = (document: Document, structure: string) => {
		// structure is a string like "root[a[a1],b[b1],c]"; returns an object whose
		// keys are the named elements.
		const nodes: Record<string, HTMLElement> = {};
		let i = 0;
		const parse = (parent: HTMLElement | null): HTMLElement => {
			let name = '';
			while (i < structure.length && /[A-Za-z0-9]/.test(structure[i]!)) {
				name += structure[i++];
			}
			const el = document.createElement(name);
			nodes[name] = el;
			if (parent) parent.appendChild(el);
			if (structure[i] === '[') {
				i++;
				while (structure[i] !== ']') {
					parse(el);
					if (structure[i] === ',') i++;
				}
				i++;
			}
			return el;
		};
		const root = parse(null);
		document.body.appendChild(root);
		return { root, nodes };
	};

	context.test(
		'Removing an inclusive ancestor of reference, pointer before reference is true, ' +
			'with a following node within root',
		({ document, cleanup }) => {
			// Tree: root[a[a1], b[b1], c]
			const { root, nodes } = buildScratchTree(document, 'root[a[a1],b[b1],c]');
			cleanup(() => root.remove());

			const iter = document.createNodeIterator(root);
			for (let i = 0; i < 5; i++) iter.nextNode();
			expect(iter.referenceNode, 'advanced reference').toBe(nodes.b1!);
			expect(iter.pointerBeforeReferenceNode, 'advanced pointer').toBe(false);
			iter.previousNode();
			expect(iter.referenceNode, 'backed-up reference').toBe(nodes.b1!);
			expect(iter.pointerBeforeReferenceNode, 'backed-up pointer').toBe(true);

			nodes.b!.remove();

			// pre-remove step 2: next-within-root exists, so reference jumps to it and
			// pointer stays true.
			expect(iter.referenceNode, 'post-removal reference').toBe(nodes.c!);
			expect(iter.pointerBeforeReferenceNode, 'post-removal pointer').toBe(true);
		},
	);
	context.test(
		'Removing an inclusive ancestor of reference, pointer before reference is true, ' +
			'with no following node within root',
		({ document, cleanup }) => {
			// Tree: root[a[a1], b[b1]] — no node after b within root.
			const { root, nodes } = buildScratchTree(document, 'root[a[a1],b[b1]]');
			cleanup(() => root.remove());

			const iter = document.createNodeIterator(root);
			for (let i = 0; i < 5; i++) iter.nextNode();
			expect(iter.referenceNode, 'advanced reference').toBe(nodes.b1!);
			expect(iter.pointerBeforeReferenceNode, 'advanced pointer').toBe(false);
			iter.previousNode();
			expect(iter.referenceNode, 'backed-up reference').toBe(nodes.b1!);
			expect(iter.pointerBeforeReferenceNode, 'backed-up pointer').toBe(true);

			nodes.b!.remove();

			// pre-remove step 2: no next-within-root, so pointer flips to false and
			// step 3 moves reference to the last inclusive descendant of b's previous
			// sibling.
			expect(iter.referenceNode, 'post-removal reference').toBe(nodes.a1!);
			expect(iter.pointerBeforeReferenceNode, 'post-removal pointer').toBe(false);
		},
	);
}
