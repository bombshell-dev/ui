import type { CompatibilityContext } from '../../../shared/context.ts';
import { assert_node } from './support/assert-node.js.ts';

// Test adapted from chromium/source/src/third_party/WebKit/LayoutTests/fast/dom/TreeWalker/script-tests/acceptNode-filter.js
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Testing with raw function filter', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);

		function filter(node: Node) {
			if ((node as Element).id == 'B1') return NodeFilter.FILTER_SKIP;
			return NodeFilter.FILTER_ACCEPT;
		}

		var walker = document.createTreeWalker(
			testElement,
			NodeFilter.SHOW_ELEMENT,
			filter as unknown as NodeFilter,
		);
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
		assert_node(expect, walker.firstChild(), { type: Element, id: 'A1' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'A1' });
		assert_node(expect, walker.nextNode(), { type: Element, id: 'B2' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'B2' });
	});
	context.test('Testing with object filter', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);

		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, {
			acceptNode: function (node: Node) {
				if ((node as Element).id == 'B1') return NodeFilter.FILTER_SKIP;
				return NodeFilter.FILTER_ACCEPT;
			},
		});
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
		assert_node(expect, walker.firstChild(), { type: Element, id: 'A1' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'A1' });
		assert_node(expect, walker.nextNode(), { type: Element, id: 'B2' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'B2' });
	});
	context.test('Testing with null filter', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);

		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, null);
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
		assert_node(expect, walker.firstChild(), { type: Element, id: 'A1' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'A1' });
		assert_node(expect, walker.nextNode(), { type: Element, id: 'B1' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'B1' });
	});
	context.test('Testing with undefined filter', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);

		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, undefined);
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
		assert_node(expect, walker.firstChild(), { type: Element, id: 'A1' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'A1' });
		assert_node(expect, walker.nextNode(), { type: Element, id: 'B1' });
		assert_node(expect, walker.currentNode, { type: Element, id: 'B1' });
	});
	context.test(
		'Testing with object lacking acceptNode property',
		({ document, NodeFilter, Element, window }) => {
			const TypeError = window.TypeError;
			const testElement = document.createElement('div');
			testElement.id = 'root';
			//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

			// XXX for Servo, build the tree without using innerHTML
			var a1 = document.createElement('div');
			a1.id = 'A1';
			var b1 = document.createElement('div');
			b1.id = 'B1';
			var b2 = document.createElement('div');
			b2.id = 'B2';
			testElement.appendChild(a1);
			a1.appendChild(b1);
			a1.appendChild(b2);

			var walker = document.createTreeWalker(
				testElement,
				NodeFilter.SHOW_ELEMENT,
				{} as NodeFilter,
			);
			expect(function () {
				walker.firstChild();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
			expect(function () {
				walker.nextNode();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
		},
	);
	context.test(
		'Testing with object with non-function acceptNode property',
		({ document, NodeFilter, Element, window }) => {
			const TypeError = window.TypeError;
			const testElement = document.createElement('div');
			testElement.id = 'root';
			//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

			// XXX for Servo, build the tree without using innerHTML
			var a1 = document.createElement('div');
			a1.id = 'A1';
			var b1 = document.createElement('div');
			b1.id = 'B1';
			var b2 = document.createElement('div');
			b2.id = 'B2';
			testElement.appendChild(a1);
			a1.appendChild(b1);
			a1.appendChild(b2);

			var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, {
				acceptNode: 'foo',
			} as unknown as NodeFilter);
			expect(function () {
				walker.firstChild();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
			expect(function () {
				walker.nextNode();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
		},
	);
	context.test(
		'Testing with function having acceptNode function',
		({ document, NodeFilter, Element, step }) => {
			const testElement = document.createElement('div');
			testElement.id = 'root';
			//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

			// XXX for Servo, build the tree without using innerHTML
			var a1 = document.createElement('div');
			a1.id = 'A1';
			var b1 = document.createElement('div');
			b1.id = 'B1';
			var b2 = document.createElement('div');
			b2.id = 'B2';
			testElement.appendChild(a1);
			a1.appendChild(b1);
			a1.appendChild(b2);

			var filter = function () {
				return NodeFilter.FILTER_ACCEPT;
			};
			Object.assign(filter, {
				acceptNode: step(() =>
					expect.unreachable('`acceptNode` method should not be called on functions'),
				),
			});
			var walker = document.createTreeWalker(
				testElement,
				NodeFilter.SHOW_ELEMENT,
				filter as unknown as NodeFilter,
			);
			assert_node(expect, walker.firstChild(), { type: Element, id: 'A1' });
			assert_node(expect, walker.nextNode(), { type: Element, id: 'B1' });
		},
	);
	context.test('Testing with filter function that throws', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);

		var test_error = { name: 'test' };
		var walker = document.createTreeWalker(
			testElement,
			NodeFilter.SHOW_ELEMENT,
			function (node: Node) {
				throw test_error;
			},
		);
		{
			let thrown: unknown;
			let didThrow = false;
			try {
				(function () {
					walker.firstChild();
				})();
			} catch (error) {
				didThrow = true;
				thrown = error;
			}
			expect(didThrow).toBe(true);
			expect(thrown).toBe(test_error);
		}
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
		{
			let thrown: unknown;
			let didThrow = false;
			try {
				(function () {
					walker.nextNode();
				})();
			} catch (error) {
				didThrow = true;
				thrown = error;
			}
			expect(didThrow).toBe(true);
			expect(thrown).toBe(test_error);
		}
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
	});
	context.test('rethrows errors when getting `acceptNode`', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);

		var testError = { name: 'test' };
		var filter = {
			get acceptNode() {
				throw testError;
			},
		};

		var walker = document.createTreeWalker(
			testElement,
			NodeFilter.SHOW_ELEMENT,
			filter as unknown as NodeFilter,
		);
		{
			let thrown: unknown;
			let didThrow = false;
			try {
				(function () {
					walker.firstChild();
				})();
			} catch (error) {
				didThrow = true;
				thrown = error;
			}
			expect(didThrow).toBe(true);
			expect(thrown).toBe(testError);
		}
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
		{
			let thrown: unknown;
			let didThrow = false;
			try {
				(function () {
					walker.nextNode();
				})();
			} catch (error) {
				didThrow = true;
				thrown = error;
			}
			expect(didThrow).toBe(true);
			expect(thrown).toBe(testError);
		}
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
	});
	context.test('performs `Get` on every traverse', ({ document, NodeFilter }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);

		var calls = 0;
		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, {
			get acceptNode() {
				calls++;
				return function () {
					return NodeFilter.FILTER_ACCEPT;
				};
			},
		});

		expect(calls).toBe(0);
		walker.nextNode();
		walker.nextNode();
		expect(calls).toBe(2);
	});
	context.test('Testing with filter object that throws', ({ document, NodeFilter, Element }) => {
		const testElement = document.createElement('div');
		testElement.id = 'root';
		//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

		// XXX for Servo, build the tree without using innerHTML
		var a1 = document.createElement('div');
		a1.id = 'A1';
		var b1 = document.createElement('div');
		b1.id = 'B1';
		var b2 = document.createElement('div');
		b2.id = 'B2';
		testElement.appendChild(a1);
		a1.appendChild(b1);
		a1.appendChild(b2);

		var test_error = { name: 'test' };
		var walker = document.createTreeWalker(testElement, NodeFilter.SHOW_ELEMENT, {
			acceptNode: function (node: Node) {
				throw test_error;
			},
		});
		{
			let thrown: unknown;
			let didThrow = false;
			try {
				(function () {
					walker.firstChild();
				})();
			} catch (error) {
				didThrow = true;
				thrown = error;
			}
			expect(didThrow).toBe(true);
			expect(thrown).toBe(test_error);
		}
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
		{
			let thrown: unknown;
			let didThrow = false;
			try {
				(function () {
					walker.nextNode();
				})();
			} catch (error) {
				didThrow = true;
				thrown = error;
			}
			expect(didThrow).toBe(true);
			expect(thrown).toBe(test_error);
		}
		assert_node(expect, walker.currentNode, { type: Element, id: 'root' });
	});
	context.test(
		'Testing with filter object: this value and `node` argument',
		({ document, NodeFilter }) => {
			const testElement = document.createElement('div');
			testElement.id = 'root';
			//testElement.innerHTML='<div id="A1"><div id="B1"></div><div id="B2"></div></div>';

			// XXX for Servo, build the tree without using innerHTML
			var a1 = document.createElement('div');
			a1.id = 'A1';
			var b1 = document.createElement('div');
			b1.id = 'B1';
			var b2 = document.createElement('div');
			b2.id = 'B2';
			testElement.appendChild(a1);
			a1.appendChild(b1);
			a1.appendChild(b2);

			let thisValue, nodeArgID;
			const filter = {
				acceptNode(node: Node) {
					thisValue = this;
					nodeArgID = (node as Element).id;
					return NodeFilter.FILTER_ACCEPT;
				},
			};

			const walker = document.createTreeWalker(
				testElement,
				NodeFilter.SHOW_ELEMENT,
				filter as unknown as NodeFilter,
			);
			walker.nextNode();

			expect(thisValue).toBe(filter);
			expect(nodeArgID).toBe('A1');
		},
	);
}
