import type { CompatibilityContext } from '../../../shared/context.ts';
import { assert_node } from './support/assert-node.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Testing nextNode', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		// testElement.innerHTML='<div id="A1">  <div id="B1">  <div id="C1"></div>  </div>  <div id="B2"></div><div id="B3"></div>  </div>';
		// <div id="A1">
		//   <div id="B1">
		//     <div id="C1"></div>
		//   </div>
		//   <div id="B2"></div>
		//   <div id="B3"></div>
		// </div>

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		var b3 = document.createElement('div');
		b3.id = 'B3';
		var c1 = document.createElement('div');
		c1.id = 'C1';

		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);
		a1.appendChild(b3);
		b1.appendChild(c1);

		var skipB1Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B1') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var skipB2Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B2') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, skipB1Filter);
		assert_node(expect, walker.nextNode(), { type: Element, id: 'A1' });
		assert_node(expect, walker.nextNode(), { type: Element, id: 'C1' });
		assert_node(expect, walker.nextNode(), { type: Element, id: 'B2' });
		assert_node(expect, walker.nextNode(), { type: Element, id: 'B3' });
	});
	context.test('Testing firstChild', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		// testElement.innerHTML='<div id="A1">  <div id="B1">  <div id="C1"></div>  </div>  <div id="B2"></div><div id="B3"></div>  </div>';
		// <div id="A1">
		//   <div id="B1">
		//     <div id="C1"></div>
		//   </div>
		//   <div id="B2"></div>
		//   <div id="B3"></div>
		// </div>

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		var b3 = document.createElement('div');
		b3.id = 'B3';
		var c1 = document.createElement('div');
		c1.id = 'C1';

		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);
		a1.appendChild(b3);
		b1.appendChild(c1);

		var skipB1Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B1') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var skipB2Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B2') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, skipB1Filter);
		assert_node(expect, walker.firstChild(), { type: Element, id: 'A1' });
		assert_node(expect, walker.firstChild(), { type: Element, id: 'C1' });
	});
	context.test('Testing nextSibling', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		// testElement.innerHTML='<div id="A1">  <div id="B1">  <div id="C1"></div>  </div>  <div id="B2"></div><div id="B3"></div>  </div>';
		// <div id="A1">
		//   <div id="B1">
		//     <div id="C1"></div>
		//   </div>
		//   <div id="B2"></div>
		//   <div id="B3"></div>
		// </div>

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		var b3 = document.createElement('div');
		b3.id = 'B3';
		var c1 = document.createElement('div');
		c1.id = 'C1';

		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);
		a1.appendChild(b3);
		b1.appendChild(c1);

		var skipB1Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B1') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var skipB2Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B2') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, skipB2Filter);
		assert_node(expect, walker.firstChild(), { type: Element, id: 'A1' });
		assert_node(expect, walker.firstChild(), { type: Element, id: 'B1' });
		assert_node(expect, walker.nextSibling(), { type: Element, id: 'B3' });
	});
	context.test('Testing parentNode', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		// testElement.innerHTML='<div id="A1">  <div id="B1">  <div id="C1"></div>  </div>  <div id="B2"></div><div id="B3"></div>  </div>';
		// <div id="A1">
		//   <div id="B1">
		//     <div id="C1"></div>
		//   </div>
		//   <div id="B2"></div>
		//   <div id="B3"></div>
		// </div>

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		var b3 = document.createElement('div');
		b3.id = 'B3';
		var c1 = document.createElement('div');
		c1.id = 'C1';

		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);
		a1.appendChild(b3);
		b1.appendChild(c1);

		var skipB1Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B1') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var skipB2Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B2') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, skipB1Filter);
		walker.currentNode = testElement.querySelectorAll('#C1')[0]!;
		assert_node(expect, walker.parentNode(), { type: Element, id: 'A1' });
	});
	context.test('Testing previousSibling', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		// testElement.innerHTML='<div id="A1">  <div id="B1">  <div id="C1"></div>  </div>  <div id="B2"></div><div id="B3"></div>  </div>';
		// <div id="A1">
		//   <div id="B1">
		//     <div id="C1"></div>
		//   </div>
		//   <div id="B2"></div>
		//   <div id="B3"></div>
		// </div>

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		var b3 = document.createElement('div');
		b3.id = 'B3';
		var c1 = document.createElement('div');
		c1.id = 'C1';

		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);
		a1.appendChild(b3);
		b1.appendChild(c1);

		var skipB1Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B1') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var skipB2Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B2') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, skipB2Filter);
		walker.currentNode = testElement.querySelectorAll('#B3')[0]!;
		assert_node(expect, walker.previousSibling(), { type: Element, id: 'B1' });
	});
	context.test('Testing previousNode', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		// testElement.innerHTML='<div id="A1">  <div id="B1">  <div id="C1"></div>  </div>  <div id="B2"></div><div id="B3"></div>  </div>';
		// <div id="A1">
		//   <div id="B1">
		//     <div id="C1"></div>
		//   </div>
		//   <div id="B2"></div>
		//   <div id="B3"></div>
		// </div>

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		var b3 = document.createElement('div');
		b3.id = 'B3';
		var c1 = document.createElement('div');
		c1.id = 'C1';

		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);
		a1.appendChild(b3);
		b1.appendChild(c1);

		var skipB1Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B1') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var skipB2Filter = {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B2') return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		};

		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, skipB1Filter);
		walker.currentNode = testElement.querySelectorAll('#B3')[0]!;
		assert_node(expect, walker.previousNode(), { type: Element, id: 'B2' });
		assert_node(expect, walker.previousNode(), { type: Element, id: 'C1' });
		assert_node(expect, walker.previousNode(), { type: Element, id: 'A1' });
	});
}
