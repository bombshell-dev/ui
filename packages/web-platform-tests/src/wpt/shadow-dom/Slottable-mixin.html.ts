import type { CompatibilityContext } from '../../shared/context.ts';

const markup1 = `<!DOCTYPE html>
<html>
<head>
<title>Shadow DOM: Slottable mixin</title>
<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">
<meta name="assert" content="Element and Text interfaces must implement Slottable mixin">



</head>
<body>
<div id="log"></div>

</body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'assignedSlot attribute must be defined on Element and Text interfaces',
		({ document, Element, Text }) => {
			expect(
				'assignedSlot' in Element.prototype,
				'assignedSlot must be defined on Element.prototype',
			).toBe(true);
			expect(
				'assignedSlot' in document.createElement('div'),
				'assignedSlot must be defined on a div element',
			).toBe(true);

			expect(
				'assignedSlot' in Text.prototype,
				'assignedSlot must be defined on Text.prototype',
			).toBe(true);
			expect(
				'assignedSlot' in document.createTextNode(''),
				'assignedSlot must be defined on a text node',
			).toBe(true);
			expect(
				'assignedSlot' in document.createComment(''),
				'assignedSlot must not be defined on a comment node',
			).toBe(false);
			expect(
				'assignedSlot' in document.createProcessingInstruction('target', 'data'),
				'assignedSlot must not be defined on a processing instruction node',
			).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'assignedSlot must return null when the node does not have an assigned node',
		({ document }) => {
			expect(
				document.createElement('div').assignedSlot,
				'assignedSlot must be null when the element is not in any tree',
			).toBe(null);

			var shadowHost = document.createElement('div');
			var shadowRoot = shadowHost.attachShadow({ mode: 'open' });

			var childElement = document.createElement('b');
			shadowHost.appendChild(childElement);
			expect(
				childElement.assignedSlot,
				'assignedSlot on an element must be null when a node is not assigned of any slot',
			).toBe(null);

			var childTextNode = document.createTextNode('');
			shadowHost.appendChild(childTextNode);
			expect(
				childTextNode.assignedSlot,
				'assignedSlot on a text node must be null when a node is not assigned of any slot',
			).toBe(null);

			var slot = document.createElement('slot');
			slot.name = 'foo';
			shadowRoot.appendChild(slot);
			expect(
				childElement.assignedSlot,
				'assignedSlot on an element must be null when a node does not match any slot',
			).toBe(null);
			expect(
				childTextNode.assignedSlot,
				'assignedSlot on a text node must be null when a node does not match any slot',
			).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'assignedSlot must return the assigned slot',
		({ document }) => {
			var shadowHost = document.createElement('div');
			var childElement = document.createElement('b');
			shadowHost.appendChild(childElement);

			var childTextNode = document.createTextNode('');
			shadowHost.appendChild(childTextNode);

			var shadowRoot = shadowHost.attachShadow({ mode: 'open' });
			var slot = document.createElement('slot');
			shadowRoot.appendChild(slot);

			expect(
				childElement.assignedSlot,
				'assignedSlot on an element must return the assigned default slot element',
			).toBe(slot);
			expect(
				childTextNode.assignedSlot,
				'assignedSlot on a text node must return the assigned default slot element',
			).toBe(slot);

			slot.name = 'foo';
			expect(
				childElement.assignedSlot,
				'assignedSlot on an element must null when the element is unassigned from a slot element',
			).toBe(null);
			expect(
				childTextNode.assignedSlot,
				'assignedSlot on a text node must null when the node is unassigned from a slot element',
			).toBe(null);

			childElement.slot = 'foo';
			expect(
				childElement.assignedSlot,
				'assignedSlot on an element must return the re-assigned slot element',
			).toBe(slot);

			slot.removeAttribute('name');
			expect(
				childTextNode.assignedSlot,
				'assignedSlot on a text node must return the re-assigned slot element',
			).toBe(slot);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'assignedSlot must return null when the assigned slot element is inside a closed shadow tree',
		({ document }) => {
			var shadowHost = document.createElement('div');
			var childElement = document.createElement('b');
			shadowHost.appendChild(childElement);

			var childTextNode = document.createTextNode('');
			shadowHost.appendChild(childTextNode);

			var shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
			var slot = document.createElement('slot');
			shadowRoot.appendChild(slot);

			expect(
				childElement.assignedSlot,
				'assignedSlot on an element must return null if the slot is inside a closed shadow tree.',
			).toBe(null);
			expect(
				childTextNode.assignedSlot,
				'assignedSlot on a text node must return null if the slot is inside a closed shadow tree.',
			).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
}
