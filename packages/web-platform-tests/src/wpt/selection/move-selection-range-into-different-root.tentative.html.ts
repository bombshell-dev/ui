import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const markup = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Updating selection range to outside of scope of the selection should cause the range removed from the selection</title>
<script></script>
<script></script>
<script></script>
</head>
<body>
<div id="rangeContainer"><br></div>
<iframe srcdoc="<div id='rangeContainer'><br></div>"></iframe>
</body>
</html>
`;

	const { expect } = context.runner;
	const ArgTypeNodeAndOffset = 0;
	const ArgTypeNode = 1;

	const rangeMethods = [
		{ name: 'selectNode', type: ArgTypeNode },
		{ name: 'selectNodeContents', type: ArgTypeNode },
		{ name: 'setEnd', type: ArgTypeNodeAndOffset },
		{ name: 'setEndAfter', type: ArgTypeNode },
		{ name: 'setEndBefore', type: ArgTypeNode },
		{ name: 'setStart', type: ArgTypeNodeAndOffset },
		{ name: 'setStartAfter', type: ArgTypeNode },
		{ name: 'setStartBefore', type: ArgTypeNode },
	] as const;

	function execute(
		range: Range,
		rangeMethod: (typeof rangeMethods)[number],
		node: Node,
		offset: number,
	) {
		switch (rangeMethod.type) {
			case ArgTypeNodeAndOffset:
				range[rangeMethod.name](node, offset);
				break;
			case ArgTypeNode:
				range[rangeMethod.name](node);
				break;
			default:
				throw new Error('Unexpected arg type is set');
		}
	}

	function selectDiv(document: Document) {
		document.getSelection()!.removeAllRanges();
		const range = document.createRange();
		range.selectNodeContents(document.getElementById('rangeContainer')!);
		document.getSelection()!.addRange(range);
	}
	function createDocumentFragment(document: Document) {
		const fragment = document.createDocumentFragment();
		const div = document.createElement('div');
		div.id = 'rangeContainer';
		div.innerHTML = '<br>';
		fragment.appendChild(div);
		return fragment;
	}

	for (const rangeMethod of rangeMethods) {
		context.test(
			`Set selection range into a document fragment with ${rangeMethod.name}`,
			({ document }) => {
				const getSelection = () => document.getSelection()!;

				selectDiv(document);
				const fragment = createDocumentFragment(document);
				execute(
					getSelection().getRangeAt(0),
					rangeMethod,
					fragment.getElementById('rangeContainer')!,
					0,
				);
				expect(getSelection().rangeCount).toBe(0);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
		context.test(
			`Set selection range into a sub-document with ${rangeMethod.name}`,
			({ document }) => {
				const getSelection = () => document.getSelection()!;

				selectDiv(document);
				const div = document
					.querySelector('iframe')!
					.contentDocument!.getElementById('rangeContainer')!;
				execute(getSelection().getRangeAt(0), rangeMethod, div, 0);
				expect(getSelection().rangeCount).toBe(0);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
	}
}
