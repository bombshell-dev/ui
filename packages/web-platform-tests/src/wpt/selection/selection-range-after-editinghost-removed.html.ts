import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const markup = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Selection range in an editing host after the host is removed</title>
<script></script>
<script></script>
<script></script>
</head>
<body><div id="container"></div></body>
</html>
`;

	const { expect } = context.runner;

	context.test(
		"Selection range in an editing host should be collapsed where the host was after it's removed",
		({ document }) => {
			const container = document.querySelector('div')!;
			const getSelection = () => document.getSelection()!;

			const editingHost = document.createElement('div');
			editingHost.contentEditable = true as unknown as string;
			editingHost.innerHTML = 'ABC<br>';
			container.appendChild(editingHost);
			editingHost.focus();
			getSelection().collapse(editingHost, 0);
			editingHost.remove();
			expect(getSelection().focusNode, 'focusNode should be the container').toBe(container);
			expect(getSelection().focusOffset, 'focusOffset should be 0').toBe(0);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Selection range in an editing host should be collapsed where the host was after its parent is removed',
		({ document }) => {
			const container = document.querySelector('div')!;
			const getSelection = () => document.getSelection()!;

			const wrapper = document.createElement('div');
			wrapper.id = 'wrapper';
			const editingHost = document.createElement('div');
			editingHost.contentEditable = true as unknown as string;
			editingHost.innerHTML = 'ABC<br>';
			wrapper.appendChild(editingHost);
			container.appendChild(wrapper);
			editingHost.focus();
			getSelection().collapse(editingHost, 0);
			wrapper.remove();
			expect(getSelection().focusNode, 'focusNode should be the container').toBe(container);
			expect(getSelection().focusOffset, 'focusOffset should be 0').toBe(0);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"Selection range in an editing host should be collapsed where the host was after it's replaced with itself (.replaceWith)",
		({ document }) => {
			const container = document.querySelector('div')!;
			const getSelection = () => document.getSelection()!;

			const editingHost = document.createElement('div');
			editingHost.contentEditable = true as unknown as string;
			editingHost.innerHTML = 'ABC<br>';
			container.appendChild(editingHost);
			editingHost.focus();
			getSelection().collapse(editingHost, 0);
			editingHost.replaceWith(editingHost);
			expect(getSelection().focusNode, 'focusNode should be the container').toBe(container);
			expect(getSelection().focusOffset, 'focusOffset should be 0').toBe(0);
			editingHost.remove();
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"Selection range in an editing host should be collapsed where the host was after it's replaced with itself (.replaceChild)",
		({ document }) => {
			const container = document.querySelector('div')!;
			const getSelection = () => document.getSelection()!;

			const editingHost = document.createElement('div');
			editingHost.contentEditable = true as unknown as string;
			editingHost.innerHTML = 'ABC<br>';
			container.appendChild(editingHost);
			editingHost.focus();
			getSelection().collapse(editingHost, 0);
			container.replaceChild(editingHost, editingHost);
			expect(getSelection().focusNode, 'focusNode should be the container').toBe(container);
			expect(getSelection().focusOffset, 'focusOffset should be 0').toBe(0);
			editingHost.remove();
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
