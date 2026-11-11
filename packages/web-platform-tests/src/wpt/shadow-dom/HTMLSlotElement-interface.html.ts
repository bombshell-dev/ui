import type { CompatibilityContext } from '../../shared/context.ts';

const markup2 = `<!DOCTYPE html>
<html>
<head>
<title>Shadow DOM: HTMLSlotElement interface</title>
<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">
<meta name="assert" content="HTMLSlotElement must exist on window with name attribute and getAssignedNode() method">



</head>
<body>
<div id="log"></div>

</body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'HTMLSlotElement must be defined on window',
		({ document, window, HTMLElement, HTMLSlotElement }) => {
			expect('HTMLSlotElement' in window, 'HTMLSlotElement must be defined on window').toBe(true);
			expect(
				Object.getPrototypeOf(HTMLSlotElement.prototype),
				'HTMLSlotElement should inherit from HTMLElement',
			).toBe(HTMLElement.prototype);
			expect(
				document.createElement('slot') instanceof HTMLSlotElement,
				'slot element should be an instance of HTMLSlotElement',
			).toBe(true);
			expect(
				document.createElement('slot') instanceof HTMLElement,
				'slot element should be an instance of HTMLElement',
			).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	context.test(
		'"name" attribute on HTMLSlotElement must reflect "name" attribute',
		({ document, HTMLSlotElement }) => {
			expect(
				'name' in HTMLSlotElement.prototype,
				'"name" attribute must be defined on HTMLSlotElement.prototype',
			).toBe(true);

			var slotElement = document.createElement('slot');
			expect(
				slotElement.name,
				'"name" attribute must return the empty string when "name" content attribute is not set',
			).toBe('');

			slotElement.setAttribute('name', 'foo');
			expect(
				slotElement.name,
				'"name" attribute must return the value of the "name" content attribute',
			).toBe('foo');

			slotElement.name = 'bar';
			expect(slotElement.name, '"name" attribute must return the assigned value').toBe('bar');
			expect(
				slotElement.getAttribute('name'),
				'"name" attribute must update the "name" content attribute',
			).toBe('bar');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	for (const options of [null, { flattened: false }, { flattened: true }]) {
		context.test(
			'assignedNodes(' +
				(options ? JSON.stringify(options) : '') +
				') on a HTMLSlotElement must return an empty array when the slot element is not in a tree or in a document tree',
			({ document, HTMLSlotElement }) => {
				expect(
					'assignedNodes' in HTMLSlotElement.prototype,
					'"assignedNodes" method must be defined on HTMLSlotElement.prototype',
				).toBe(true);

				var slotElement = document.createElement('slot');
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes() must return an empty array when the slot element is not in any tree',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes() must return an empty array when the slot element is not in any tree',
						).toBe(expected[index]);
				}

				document.body.appendChild(slotElement);
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes() must return an empty array when the slot element is in a document tree',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes() must return an empty array when the slot element is in a document tree',
						).toBe(expected[index]);
				}
			},
			{
				document: {
					contentType: 'text/html',
					content: markup2,
				},
			},
		);
	}
	for (const options of [null, { flattened: false }, { flattened: true }]) {
		context.test(
			'assignedNodes(' +
				(options ? JSON.stringify(options) : '') +
				') must return the list of assigned nodes when none of the assigned nodes themselves are slots',
			({ document, HTMLSlotElement }) => {
				expect(
					'assignedNodes' in HTMLSlotElement.prototype,
					'"assignedNodes" method must be defined on HTMLSlotElement.prototype',
				).toBe(true);

				var shadowHost = document.createElement('div');
				var child = document.createElement('p');

				var shadowRoot = shadowHost.attachShadow({ mode: 'open' });
				var slotElement = document.createElement('slot');
				shadowRoot.appendChild(slotElement);

				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes() must return an empty array when there are no nodes in the shadow tree',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes() must return an empty array when there are no nodes in the shadow tree',
						).toBe(expected[index]);
				}

				shadowHost.appendChild(child);
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected = [child];
					expect(
						actual.length,
						'assignedNodes() on a default slot must return an element without slot element',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes() on a default slot must return an element without slot element',
						).toBe(expected[index]);
				}

				child.setAttribute('slot', 'foo');
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes() on a default slot must not return an element with non-empty slot attribute',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes() on a default slot must not return an element with non-empty slot attribute',
						).toBe(expected[index]);
				}

				child.setAttribute('slot', '');
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected = [child];
					expect(
						actual.length,
						'assignedNodes() on a default slot must return an element with empty slot attribute',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes() on a default slot must return an element with empty slot attribute',
						).toBe(expected[index]);
				}

				slotElement.setAttribute('name', 'bar');
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes() on a named slot must not return an element with empty slot attribute',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes() on a named slot must not return an element with empty slot attribute',
						).toBe(expected[index]);
				}

				slotElement.setAttribute('name', '');
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected = [child];
					expect(
						actual.length,
						'assignedNodes() on an empty name slot must return an element with empty slot attribute',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes() on an empty name slot must return an element with empty slot attribute',
						).toBe(expected[index]);
				}
			},
			{
				document: {
					contentType: 'text/html',
					content: markup2,
				},
			},
		);
	}
	for (const options of [null, { flattened: false }, { flattened: true }]) {
		context.test(
			'assignedNodes(' +
				(options ? JSON.stringify(options) : '') +
				') must update when slot and name attributes are modified',
			({ document }) => {
				var shadowHost = document.createElement('div');
				var p = document.createElement('p');
				var b = document.createElement('b');
				shadowHost.appendChild(p);
				shadowHost.appendChild(b);

				var shadowRoot = shadowHost.attachShadow({ mode: 'open' });
				var slotElement = document.createElement('slot');
				shadowRoot.appendChild(slotElement);

				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected = [p, b];
					expect(actual.length, 'assignedNodes must return the distributed nodes').toBe(
						expected.length,
					);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'assignedNodes must return the distributed nodes').toBe(
							expected[index],
						);
				}

				slotElement.name = 'foo';
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes must be empty when there are no matching elements for the slot name',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes must be empty when there are no matching elements for the slot name',
						).toBe(expected[index]);
				}

				b.slot = 'foo';
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected = [b];
					expect(
						actual.length,
						'assignedNodes must return the nodes with the matching slot name',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes must return the nodes with the matching slot name',
						).toBe(expected[index]);
				}

				p.slot = 'foo';
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected = [p, b];
					expect(
						actual.length,
						'assignedNodes must return the nodes with the matching slot name in the tree order',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes must return the nodes with the matching slot name in the tree order',
						).toBe(expected[index]);
				}

				slotElement.removeAttribute('name');
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes must be empty for a default slot when all elements have "slot" attributes specified',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes must be empty for a default slot when all elements have "slot" attributes specified',
						).toBe(expected[index]);
				}
			},
			{
				document: {
					contentType: 'text/html',
					content: markup2,
				},
			},
		);
	}
	for (const options of [null, { flattened: false }, { flattened: true }]) {
		context.test(
			'assignedNodes(' +
				(options ? JSON.stringify(options) : '') +
				') must update when a default slot is introduced dynamically by a slot rename',
			({ document }) => {
				var shadowHost = document.createElement('div');
				var child = document.createElement('span');
				shadowHost.appendChild(child);

				var shadowRoot = shadowHost.attachShadow({ mode: 'open' });
				var slotElement = document.createElement('slot');
				slotElement.name = 'foo';
				shadowRoot.appendChild(slotElement);

				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes must be empty when there are no matching elements for the slot name',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes must be empty when there are no matching elements for the slot name',
						).toBe(expected[index]);
				}

				slotElement.removeAttribute('name');
				{
					const actual = slotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected = [child];
					expect(
						actual.length,
						'assignedNodes must be empty when there are no matching elements for the slot name',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes must be empty when there are no matching elements for the slot name',
						).toBe(expected[index]);
				}
			},
			{
				document: {
					contentType: 'text/html',
					content: markup2,
				},
			},
		);
	}
	for (const options of [null, { flattened: false }, { flattened: true }]) {
		context.test(
			'assignedNodes(' +
				(options ? JSON.stringify(options) : '') +
				') must update when slot elements are inserted or removed',
			({ document }) => {
				var shadowHost = document.createElement('div');
				var p = document.createElement('p');
				var text = document.createTextNode('');
				var comment = document.createComment('');
				var processingInstruction = document.createProcessingInstruction('target', 'data');
				var b = document.createElement('b');
				shadowHost.appendChild(p);
				shadowHost.appendChild(text);
				shadowHost.appendChild(comment);
				shadowHost.appendChild(processingInstruction);
				shadowHost.appendChild(b);

				var shadowRoot = shadowHost.attachShadow({ mode: 'open' });

				var firstSlotElement = document.createElement('slot');
				shadowRoot.appendChild(firstSlotElement);

				var secondSlotElement = document.createElement('slot');
				shadowRoot.appendChild(secondSlotElement);

				{
					const actual = firstSlotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected = [p, text, b];
					expect(
						actual.length,
						'assignedNodes on a default slot must return the elements without slot attributes and text nodes',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes on a default slot must return the elements without slot attributes and text nodes',
						).toBe(expected[index]);
				}
				{
					const actual = secondSlotElement.assignedNodes(
						options as unknown as AssignedNodesOptions,
					);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes on the second unnamed slot element must return an empty array',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes on the second unnamed slot element must return an empty array',
						).toBe(expected[index]);
				}

				shadowRoot.removeChild(firstSlotElement);
				{
					const actual = firstSlotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes on a detached formerly-default slot must return an empty array',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes on a detached formerly-default slot must return an empty array',
						).toBe(expected[index]);
				}
				{
					const actual = secondSlotElement.assignedNodes(
						options as unknown as AssignedNodesOptions,
					);
					const expected = [p, text, b];
					expect(
						actual.length,
						'assignedNodes on the second unnamed slot element after removing the first must return the elements without slot attributes and text nodes',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes on the second unnamed slot element after removing the first must return the elements without slot attributes and text nodes',
						).toBe(expected[index]);
				}

				shadowRoot.removeChild(secondSlotElement);
				shadowRoot.appendChild(secondSlotElement);
				{
					const actual = firstSlotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected: never[] = [];
					expect(
						actual.length,
						'Removing and re-inserting a default slot must not change the result of assignedNodes on a detached slot',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'Removing and re-inserting a default slot must not change the result of assignedNodes on a detached slot',
						).toBe(expected[index]);
				}
				{
					const actual = secondSlotElement.assignedNodes(
						options as unknown as AssignedNodesOptions,
					);
					const expected = [p, text, b];
					expect(
						actual.length,
						'Removing and re-inserting a default slot must not change the result of assignedNodes',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'Removing and re-inserting a default slot must not change the result of assignedNodes',
						).toBe(expected[index]);
				}

				shadowRoot.insertBefore(firstSlotElement, secondSlotElement);
				{
					const actual = firstSlotElement.assignedNodes(options as unknown as AssignedNodesOptions);
					const expected = [p, text, b];
					expect(
						actual.length,
						'assignedNodes on a newly inserted unnamed slot element must return the elements without slot attributes and text nodes',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes on a newly inserted unnamed slot element must return the elements without slot attributes and text nodes',
						).toBe(expected[index]);
				}
				{
					const actual = secondSlotElement.assignedNodes(
						options as unknown as AssignedNodesOptions,
					);
					const expected: never[] = [];
					expect(
						actual.length,
						'assignedNodes on formerly-first but now second unnamed slot element must return an empty array',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'assignedNodes on formerly-first but now second unnamed slot element must return an empty array',
						).toBe(expected[index]);
				}
			},
			{
				document: {
					contentType: 'text/html',
					content: markup2,
				},
			},
		);
	}
	context.test(
		'assignedNodes({flatten: true}) must return the distributed nodes, and assignedNodes() and assignedNodes({flatten: false}) must returned the assigned nodes',
		({ document }) => {
			var outerHost = document.createElement('div');
			var outerChild = document.createElement('span');
			outerHost.appendChild(outerChild);

			var outerShadow = outerHost.attachShadow({ mode: 'closed' });
			var innerHost = document.createElement('div');
			var outerSlot = document.createElement('slot');
			var innerChild = document.createElement('b');
			outerShadow.appendChild(innerHost);
			innerHost.appendChild(outerSlot);
			innerHost.appendChild(innerChild);

			var innerShadow = innerHost.attachShadow({ mode: 'closed' });
			var innerSlot = document.createElement('slot');
			innerShadow.appendChild(innerSlot);

			{
				const actual = outerSlot.assignedNodes();
				const expected = [outerChild];
				expect(
					actual.length,
					'assignedNodes() on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = outerSlot.assignedNodes({ flatten: false });
				const expected = [outerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = outerSlot.assignedNodes({ flatten: true });
				const expected = [outerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) on a default slot must return the assigned nodes if they are not themselves slots',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) on a default slot must return the assigned nodes if they are not themselves slots',
					).toBe(expected[index]);
			}

			{
				const actual = innerSlot.assignedNodes();
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes() on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: false });
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: true });
				const expected = [outerChild, innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
					).toBe(expected[index]);
			}

			outerSlot.name = 'foo';
			{
				const actual = outerSlot.assignedNodes();
				const expected: never[] = [];
				expect(
					actual.length,
					'assignedNodes() on a named slot must return an empty array if there are no matching elements',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() on a named slot must return an empty array if there are no matching elements',
					).toBe(expected[index]);
			}
			{
				const actual = outerSlot.assignedNodes({ flatten: false });
				const expected: never[] = [];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) on a named slot must return an empty array if there are no matching elements',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) on a named slot must return an empty array if there are no matching elements',
					).toBe(expected[index]);
			}
			{
				const actual = outerSlot.assignedNodes({ flatten: true });
				const expected: never[] = [];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) on a named slot must return an empty array if there are no matching elements',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) on a named slot must return an empty array if there are no matching elements',
					).toBe(expected[index]);
			}

			{
				const actual = innerSlot.assignedNodes();
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes() on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: false });
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: true });
				const expected = [innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
					).toBe(expected[index]);
			}

			outerChild.slot = 'foo';
			{
				const actual = outerSlot.assignedNodes();
				const expected = [outerChild];
				expect(actual.length, 'assignedNodes() on a named slot must return matching elements').toBe(
					expected.length,
				);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() on a named slot must return matching elements',
					).toBe(expected[index]);
			}
			{
				const actual = outerSlot.assignedNodes({ flatten: false });
				const expected = [outerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) on a named slot must return matching elements',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) on a named slot must return matching elements',
					).toBe(expected[index]);
			}
			{
				const actual = outerSlot.assignedNodes({ flatten: true });
				const expected = [outerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) on a named slot must return matching elements',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) on a named slot must return matching elements',
					).toBe(expected[index]);
			}

			{
				const actual = innerSlot.assignedNodes();
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes() on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: false });
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: true });
				const expected = [outerChild, innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
					).toBe(expected[index]);
			}

			var newInnerSlot = document.createElement('slot');
			innerShadow.insertBefore(newInnerSlot, innerSlot);
			{
				const actual = newInnerSlot.assignedNodes();
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes() on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = newInnerSlot.assignedNodes({ flatten: false });
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = newInnerSlot.assignedNodes({ flatten: true });
				const expected = [outerChild, innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
					).toBe(expected[index]);
			}

			{
				const actual = innerSlot.assignedNodes();
				const expected: never[] = [];
				expect(
					actual.length,
					'assignedNodes() on a nameless slot element which appears after a default slot must return an empty array',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() on a nameless slot element which appears after a default slot must return an empty array',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: false });
				const expected: never[] = [];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) on a nameless slot element which appears after a default slot must return an empty array',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) on a nameless slot element which appears after a default slot must return an empty array',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: true });
				const expected: never[] = [];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) on a nameless slot element which appears after a default slot must return an empty array',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) on a nameless slot element which appears after a default slot must return an empty array',
					).toBe(expected[index]);
			}

			innerShadow.removeChild(newInnerSlot);
			{
				const actual = newInnerSlot.assignedNodes();
				const expected: never[] = [];
				expect(
					actual.length,
					'assignedNodes() must return an empty array when the slot element is not in any tree',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() must return an empty array when the slot element is not in any tree',
					).toBe(expected[index]);
			}
			{
				const actual = newInnerSlot.assignedNodes({ flatten: false });
				const expected: never[] = [];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) must return an empty array when the slot element is not in any tree',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) must return an empty array when the slot element is not in any tree',
					).toBe(expected[index]);
			}
			{
				const actual = newInnerSlot.assignedNodes({ flatten: true });
				const expected: never[] = [];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) must return an empty array when the slot element is not in any tree',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) must return an empty array when the slot element is not in any tree',
					).toBe(expected[index]);
			}

			{
				const actual = innerSlot.assignedNodes();
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes() on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes() on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: false });
				const expected = [outerSlot, innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: false}) on a default slot must return the assigned nodes',
					).toBe(expected[index]);
			}
			{
				const actual = innerSlot.assignedNodes({ flatten: true });
				const expected = [outerChild, innerChild];
				expect(
					actual.length,
					'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'assignedNodes({flatten: true}) on a default slot must return the distributed nodes',
					).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
}
