import type { CompatibilityContext } from '../../../shared/context.ts';
import { assert_node } from './support/assert-node.js.ts';
import { assert_readonly } from '../../resources/testharness.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function createSampleDOM(document: Document) {
		// Tree structure:
		//             #a
		//             |
		//        +----+----+
		//        |         |
		//       "b"        #c
		//                  |
		//             +----+----+
		//             |         |
		//            #d      <!--j-->
		//             |
		//        +----+----+
		//        |    |    |
		//       "e"  #f   "i"
		//             |
		//          +--+--+
		//          |     |
		//         "g" <!--h-->
		var div = document.createElement('div');
		div.id = 'a';
		// div.innerHTML = 'b<div id="c"><div id="d">e<span id="f">g<!--h--></span>i</div><!--j--></div>';

		div.appendChild(document.createTextNode('b'));

		var c = document.createElement('div');
		c.id = 'c';
		div.appendChild(c);

		var d = document.createElement('div');
		d.id = 'd';
		c.appendChild(d);

		var e = document.createTextNode('e');
		d.appendChild(e);

		var f = document.createElement('span');
		f.id = 'f';
		d.appendChild(f);

		var g = document.createTextNode('g');
		f.appendChild(g);

		var h = document.createComment('h');
		f.appendChild(h);

		var i = document.createTextNode('i');
		d.appendChild(i);

		var j = document.createComment('j');
		c.appendChild(j);

		return div;
	}

	function check_walker(walker: TreeWalker, root: Node, whatToShowValue?: number) {
		whatToShowValue = whatToShowValue === undefined ? 0xffffffff : whatToShowValue;

		expect(walker.toString(), 'toString').toBe('[object TreeWalker]');
		expect(walker.root, 'root').toBe(root);
		expect(walker.whatToShow, 'whatToShow').toBe(whatToShowValue);
		expect(walker.filter, 'filter').toBe(null);
		expect(walker.currentNode, 'currentNode').toBe(root);
		assert_readonly(expect, walker, 'root');
		assert_readonly(expect, walker, 'whatToShow');
		assert_readonly(expect, walker, 'filter');
	}

	context.test('Construct a TreeWalker by document.createTreeWalker(root).', ({ document }) => {
		var root = createSampleDOM(document);
		var walker = document.createTreeWalker(root);
		check_walker(walker, root);
	});
	context.test(
		'Construct a TreeWalker by document.createTreeWalker(root, null, null).',
		({ document }) => {
			var root = createSampleDOM(document);
			var walker = document.createTreeWalker(root, null as unknown as number, null);
			check_walker(walker, root, 0);
		},
	);
	context.test(
		'Construct a TreeWalker by document.createTreeWalker(root, undefined, undefined).',
		({ document }) => {
			var root = createSampleDOM(document);
			var walker = document.createTreeWalker(root, undefined, undefined);
			check_walker(walker, root);
		},
	);
	context.test(
		'Give an invalid root node to document.createTreeWalker().',
		({ document, TypeError }) => {
			expect(function () {
				(document.createTreeWalker as () => TreeWalker)();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				document.createTreeWalker(null as unknown as Node);
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				document.createTreeWalker(undefined as unknown as Node);
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				document.createTreeWalker(new Object() as unknown as Node);
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				document.createTreeWalker(1 as unknown as Node);
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
	);
	context.test('Walk over nodes.', ({ document, Element, Text, Comment }) => {
		var root = createSampleDOM(document);
		var walker = document.createTreeWalker(root);
		var f = root.lastChild!.firstChild!.childNodes[1]!; // An element node: div#f.

		assert_node(expect, walker.currentNode, { type: Element, id: 'a' });
		expect(walker.parentNode()).toBe(null);
		assert_node(expect, walker.currentNode, { type: Element, id: 'a' });
		assert_node(expect, walker.firstChild(), { type: Text, nodeValue: 'b' });
		assert_node(expect, walker.currentNode, { type: Text, nodeValue: 'b' });
		assert_node(expect, walker.nextSibling(), { type: Element, id: 'c' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'c' });
		assert_node(expect, walker.lastChild(), { type: Comment, nodeValue: 'j' });
		assert_node(expect, walker.currentNode, { type: Comment, nodeValue: 'j' });
		assert_node(expect, walker.previousSibling(), { type: Element, id: 'd' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'd' });
		assert_node(expect, walker.nextNode(), { type: Text, nodeValue: 'e' });
		assert_node(expect, walker.currentNode, { type: Text, nodeValue: 'e' });
		assert_node(expect, walker.parentNode(), { type: Element, id: 'd' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'd' });
		assert_node(expect, walker.previousNode(), { type: Element, id: 'c' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'c' });
		expect(walker.nextSibling()).toBe(null);
		assert_node(expect, walker.currentNode, { type: Element, id: 'c' });
		walker.currentNode = f;
		expect(walker.currentNode).toBe(f);
	});
	context.test(
		'Optional arguments to createTreeWalker should be optional (3 passed, null).',
		({ document }) => {
			var treeWalker = document.createTreeWalker(document.body, 42, null);
			expect(treeWalker.root).toBe(document.body);
			expect(treeWalker.currentNode).toBe(document.body);
			expect(treeWalker.whatToShow).toBe(42);
			expect(treeWalker.filter).toBe(null);
		},
	);
}
