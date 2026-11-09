import type { CompatibilityContext } from '../../shared/context.ts';

const markup1 = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>inert nodes are unfocusable</title>
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
  </head>
<body id="body" tabindex="1">
  <button id="focusable">Outside of inert container</button>
  <button inert id="inert">Inert button</button>
  <div inert id="container">
    <input id="text" type="text">
    <input id="datetime" type="datetime">
    <input id="color" type="color">
    <select id="select">
        <optgroup id="optgroup">
            <option id="option">Option</option>
        </optgroup>
    </select>
    <div id="contenteditable-div" contenteditable>I'm editable</div>
    <span id="tabindex-span" tabindex="0">I'm tabindexed.</span>
    <a id="anchor" href="">Link</a>
  </div>

</body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Button outside of inert container is focusable.',
		async ({ document, Node }) => {
			function testFocus(element: HTMLElement, expectFocus: boolean) {
				let focusedElement: HTMLElement | null = null;
				element.addEventListener(
					'focus',
					function () {
						focusedElement = element;
					},
					false,
				);
				element.focus();
				const theElement = element;
				expect(focusedElement === theElement).toBe(expectFocus);
			}

			function testTree(element: Node, expectFocus: boolean, excludeCurrent = false) {
				if (element.nodeType == Node.ELEMENT_NODE && !excludeCurrent)
					testFocus(element as HTMLElement, expectFocus);
				if ((element as Element).tagName === 'SELECT') return;
				let childNodes = element.childNodes;
				for (let i = 0; i < childNodes.length; i++) testTree(childNodes[i]!, expectFocus);
			}

			testFocus(document.getElementById('focusable')!, true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'Button with inert atribute is unfocusable.',
		async ({ document, Node }) => {
			function testFocus(element: HTMLElement, expectFocus: boolean) {
				let focusedElement: HTMLElement | null = null;
				element.addEventListener(
					'focus',
					function () {
						focusedElement = element;
					},
					false,
				);
				element.focus();
				const theElement = element;
				expect(focusedElement === theElement).toBe(expectFocus);
			}

			function testTree(element: Node, expectFocus: boolean, excludeCurrent = false) {
				if (element.nodeType == Node.ELEMENT_NODE && !excludeCurrent)
					testFocus(element as HTMLElement, expectFocus);
				if ((element as Element).tagName === 'SELECT') return;
				let childNodes = element.childNodes;
				for (let i = 0; i < childNodes.length; i++) testTree(childNodes[i]!, expectFocus);
			}

			testFocus(document.getElementById('inert')!, false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'All focusable elements inside inert subtree are unfocusable',
		async ({ document, Node }) => {
			function testFocus(element: HTMLElement, expectFocus: boolean) {
				let focusedElement: HTMLElement | null = null;
				element.addEventListener(
					'focus',
					function () {
						focusedElement = element;
					},
					false,
				);
				element.focus();
				const theElement = element;
				expect(focusedElement === theElement).toBe(expectFocus);
			}

			function testTree(element: Node, expectFocus: boolean, excludeCurrent = false) {
				if (element.nodeType == Node.ELEMENT_NODE && !excludeCurrent)
					testFocus(element as HTMLElement, expectFocus);
				if ((element as Element).tagName === 'SELECT') return;
				let childNodes = element.childNodes;
				for (let i = 0; i < childNodes.length; i++) testTree(childNodes[i]!, expectFocus);
			}

			testTree(document.getElementById('container')!, false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'Can get inert via property',
		async ({ document, Node }) => {
			function testFocus(element: HTMLElement, expectFocus: boolean) {
				let focusedElement: HTMLElement | null = null;
				element.addEventListener(
					'focus',
					function () {
						focusedElement = element;
					},
					false,
				);
				element.focus();
				const theElement = element;
				expect(focusedElement === theElement).toBe(expectFocus);
			}

			function testTree(element: Node, expectFocus: boolean, excludeCurrent = false) {
				if (element.nodeType == Node.ELEMENT_NODE && !excludeCurrent)
					testFocus(element as HTMLElement, expectFocus);
				if ((element as Element).tagName === 'SELECT') return;
				let childNodes = element.childNodes;
				for (let i = 0; i < childNodes.length; i++) testTree(childNodes[i]!, expectFocus);
			}

			expect(document.getElementById('focusable')!.inert, 'Inert not set explicitly is false').toBe(
				false,
			);
			expect(document.getElementById('inert')!.inert, 'Inert set explicitly is true').toBe(true);
			expect(document.getElementById('container')!.inert, 'Inert set on container is true').toBe(
				true,
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		"Elements inside of inert subtrees return false when getting 'inert'",
		async ({ document, Node }) => {
			function testFocus(element: HTMLElement, expectFocus: boolean) {
				let focusedElement: HTMLElement | null = null;
				element.addEventListener(
					'focus',
					function () {
						focusedElement = element;
					},
					false,
				);
				element.focus();
				const theElement = element;
				expect(focusedElement === theElement).toBe(expectFocus);
			}

			function testTree(element: Node, expectFocus: boolean, excludeCurrent = false) {
				if (element.nodeType == Node.ELEMENT_NODE && !excludeCurrent)
					testFocus(element as HTMLElement, expectFocus);
				if ((element as Element).tagName === 'SELECT') return;
				let childNodes = element.childNodes;
				for (let i = 0; i < childNodes.length; i++) testTree(childNodes[i]!, expectFocus);
			}

			expect(
				document.getElementById('text')!.inert,
				'Elements inside of inert subtrees return false when getting inert',
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
		'Setting inert via property correctly modifies inert state',
		async ({ document, Node }) => {
			function testFocus(element: HTMLElement, expectFocus: boolean) {
				let focusedElement: HTMLElement | null = null;
				element.addEventListener(
					'focus',
					function () {
						focusedElement = element;
					},
					false,
				);
				element.focus();
				const theElement = element;
				expect(focusedElement === theElement).toBe(expectFocus);
			}

			function testTree(element: Node, expectFocus: boolean, excludeCurrent = false) {
				if (element.nodeType == Node.ELEMENT_NODE && !excludeCurrent)
					testFocus(element as HTMLElement, expectFocus);
				if ((element as Element).tagName === 'SELECT') return;
				let childNodes = element.childNodes;
				for (let i = 0; i < childNodes.length; i++) testTree(childNodes[i]!, expectFocus);
			}

			document.getElementById('focusable')!.inert = true;
			testFocus(document.getElementById('focusable')!, false);
			document.getElementById('inert')!.inert = false;
			testFocus(document.getElementById('inert')!, true);
			document.getElementById('container')!.inert = false;
			testTree(document.getElementById('container')!, true, true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
}
