import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		{
			const content = `<!DOCTYPE html>
<meta charset=utf-8>
<title>dialog element: showModal()</title>




<div id="log"></div>
<button id="b0">OK</button>
<dialog id="d1">
  <p>foobar</p>
  <button id="b1">OK</button>
</dialog>
<dialog id="d2" open>
  <p>foobar</p>
  <button>OK</button>
</dialog>
<dialog id="d3">
  <p>foobar</p>
  <button id="b3">OK</button>
</dialog>
<dialog id="d4">
  <p>foobar</p>
  <button id="b4">OK</button>
</dialog>
<dialog id="d5">
  <p>foobar</p>
  <button id="b5">OK</button>
</dialog>
<dialog id="d6"></dialog>
<dialog id="d7">
  <input id="i71" value="foobar">
  <input id="i72" value="foobar">
  <button id="b7">OK</button>
</dialog>
<dialog id="d8">
  <input id="i81" value="foobar">
  <input id="i82" value="foobar" autofocus>
  <button id="b8">OK</button>
</dialog>
<dialog id="d9"></dialog>
<dialog id="d10"></dialog>
<dialog id="d11"></dialog>

`;

			context.test(
				'opening dialog without focusable children',
				({ document, cleanup }) => {
					const d1 = document.getElementById('d1') as HTMLDialogElement;
					const d2 = document.getElementById('d2') as HTMLDialogElement;
					const d3 = document.getElementById('d3') as HTMLDialogElement;
					const d4 = document.getElementById('d4') as HTMLDialogElement;
					const d5 = document.getElementById('d5') as HTMLDialogElement;
					const d6 = document.getElementById('d6') as HTMLDialogElement;
					const d7 = document.getElementById('d7') as HTMLDialogElement;
					const d8 = document.getElementById('d8') as HTMLDialogElement;
					const d9 = document.getElementById('d9') as HTMLDialogElement;
					const d10 = document.getElementById('d10') as HTMLDialogElement;
					const d11 = document.getElementById('d11') as HTMLDialogElement;
					const b0 = document.getElementById('b0') as HTMLButtonElement;
					const b1 = document.getElementById('b1') as HTMLButtonElement;
					const b3 = document.getElementById('b3') as HTMLButtonElement;
					const b4 = document.getElementById('b4') as HTMLButtonElement;
					const b5 = document.getElementById('b5') as HTMLButtonElement;

					expect(d6.open).toBe(false);
					d6.showModal();
					cleanup(function () {
						d6.close();
					});
					expect(d6.open).toBe(true);
					expect(document.activeElement).toBe(d6);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'opening dialog with multiple focusable children',
				({ document, cleanup }) => {
					const d1 = document.getElementById('d1') as HTMLDialogElement;
					const d2 = document.getElementById('d2') as HTMLDialogElement;
					const d3 = document.getElementById('d3') as HTMLDialogElement;
					const d4 = document.getElementById('d4') as HTMLDialogElement;
					const d5 = document.getElementById('d5') as HTMLDialogElement;
					const d6 = document.getElementById('d6') as HTMLDialogElement;
					const d7 = document.getElementById('d7') as HTMLDialogElement;
					const d8 = document.getElementById('d8') as HTMLDialogElement;
					const d9 = document.getElementById('d9') as HTMLDialogElement;
					const d10 = document.getElementById('d10') as HTMLDialogElement;
					const d11 = document.getElementById('d11') as HTMLDialogElement;
					const b0 = document.getElementById('b0') as HTMLButtonElement;
					const b1 = document.getElementById('b1') as HTMLButtonElement;
					const b3 = document.getElementById('b3') as HTMLButtonElement;
					const b4 = document.getElementById('b4') as HTMLButtonElement;
					const b5 = document.getElementById('b5') as HTMLButtonElement;

					expect(d7.open).toBe(false);
					d7.showModal();
					cleanup(function () {
						d7.close();
					});
					expect(d7.open).toBe(true);
					expect(document.activeElement).toBe(document.getElementById('i71'));
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'opening dialog with multiple focusable children, one having the autofocus attribute',
				({ document, cleanup }) => {
					const d1 = document.getElementById('d1') as HTMLDialogElement;
					const d2 = document.getElementById('d2') as HTMLDialogElement;
					const d3 = document.getElementById('d3') as HTMLDialogElement;
					const d4 = document.getElementById('d4') as HTMLDialogElement;
					const d5 = document.getElementById('d5') as HTMLDialogElement;
					const d6 = document.getElementById('d6') as HTMLDialogElement;
					const d7 = document.getElementById('d7') as HTMLDialogElement;
					const d8 = document.getElementById('d8') as HTMLDialogElement;
					const d9 = document.getElementById('d9') as HTMLDialogElement;
					const d10 = document.getElementById('d10') as HTMLDialogElement;
					const d11 = document.getElementById('d11') as HTMLDialogElement;
					const b0 = document.getElementById('b0') as HTMLButtonElement;
					const b1 = document.getElementById('b1') as HTMLButtonElement;
					const b3 = document.getElementById('b3') as HTMLButtonElement;
					const b4 = document.getElementById('b4') as HTMLButtonElement;
					const b5 = document.getElementById('b5') as HTMLButtonElement;

					expect(d8.open).toBe(false);
					d8.showModal();
					cleanup(function () {
						d8.close();
					});
					expect(d8.open).toBe(true);
					expect(document.activeElement).toBe(document.getElementById('i82'));
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
	{
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<meta charset=utf-8>
<title>dialog element: showModal()</title>




<div id="log"></div>
<button id="b0">OK</button>
<dialog id="d1">
  <p>foobar</p>
  <button id="b1">OK</button>
</dialog>
<dialog id="d2" open>
  <p>foobar</p>
  <button>OK</button>
</dialog>
<dialog id="d3">
  <p>foobar</p>
  <button id="b3">OK</button>
</dialog>
<dialog id="d4">
  <p>foobar</p>
  <button id="b4">OK</button>
</dialog>
<dialog id="d5">
  <p>foobar</p>
  <button id="b5">OK</button>
</dialog>
<dialog id="d6"></dialog>
<dialog id="d7">
  <input id="i71" value="foobar">
  <input id="i72" value="foobar">
  <button id="b7">OK</button>
</dialog>
<dialog id="d8">
  <input id="i81" value="foobar">
  <input id="i82" value="foobar" autofocus>
  <button id="b8">OK</button>
</dialog>
<dialog id="d9"></dialog>
<dialog id="d10"></dialog>
<dialog id="d11"></dialog>

`;
		context.test(
			'dialog element: showModal()',
			(fixture) => {
				const { document } = fixture;
				const d1 = document.getElementById('d1') as HTMLDialogElement;
				const d2 = document.getElementById('d2') as HTMLDialogElement;
				const d3 = document.getElementById('d3') as HTMLDialogElement;
				const d4 = document.getElementById('d4') as HTMLDialogElement;
				const d5 = document.getElementById('d5') as HTMLDialogElement;
				const d6 = document.getElementById('d6') as HTMLDialogElement;
				const d7 = document.getElementById('d7') as HTMLDialogElement;
				const d8 = document.getElementById('d8') as HTMLDialogElement;
				const d9 = document.getElementById('d9') as HTMLDialogElement;
				const d10 = document.getElementById('d10') as HTMLDialogElement;
				const d11 = document.getElementById('d11') as HTMLDialogElement;
				const b0 = document.getElementById('b0') as HTMLButtonElement;
				const b1 = document.getElementById('b1') as HTMLButtonElement;
				const b3 = document.getElementById('b3') as HTMLButtonElement;
				const b4 = document.getElementById('b4') as HTMLButtonElement;
				const b5 = document.getElementById('b5') as HTMLButtonElement;
				const getComputedStyle = fixture.getComputedStyle;

				expect(d1.open).toBe(false);
				expect(d1.hasAttribute('open')).toBe(false);
				expect(getComputedStyle(d1).display).toBe('none');
				d1.showModal();
				fixture.cleanup(function () {
					d1.close();
				});
				expect(d1.open).toBe(true);
				expect(d1.getAttribute('open')).toBe('');
				expect(getComputedStyle(d1).display).toBe('block');
				expect(document.activeElement).toBe(b1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'showModal() on a <dialog> that already has an open attribute throws an InvalidStateError exception',
			({ document, cleanup, DOMException }) => {
				const d1 = document.getElementById('d1') as HTMLDialogElement;
				const d2 = document.getElementById('d2') as HTMLDialogElement;
				const d3 = document.getElementById('d3') as HTMLDialogElement;
				const d4 = document.getElementById('d4') as HTMLDialogElement;
				const d5 = document.getElementById('d5') as HTMLDialogElement;
				const d6 = document.getElementById('d6') as HTMLDialogElement;
				const d7 = document.getElementById('d7') as HTMLDialogElement;
				const d8 = document.getElementById('d8') as HTMLDialogElement;
				const d9 = document.getElementById('d9') as HTMLDialogElement;
				const d10 = document.getElementById('d10') as HTMLDialogElement;
				const d11 = document.getElementById('d11') as HTMLDialogElement;
				const b0 = document.getElementById('b0') as HTMLButtonElement;
				const b1 = document.getElementById('b1') as HTMLButtonElement;
				const b3 = document.getElementById('b3') as HTMLButtonElement;
				const b4 = document.getElementById('b4') as HTMLButtonElement;
				const b5 = document.getElementById('b5') as HTMLButtonElement;

				cleanup(function () {
					d2.close();
				});
				expect(function () {
					d2.showModal();
				}).toThrow(
					expect.objectContaining({
						name: 'InvalidStateError',
						code: 11,
						constructor: DOMException,
					}),
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'showModal() on a <dialog> after initial showModal() and removing the open attribute',
			({ document, cleanup }) => {
				const d1 = document.getElementById('d1') as HTMLDialogElement;
				const d2 = document.getElementById('d2') as HTMLDialogElement;
				const d3 = document.getElementById('d3') as HTMLDialogElement;
				const d4 = document.getElementById('d4') as HTMLDialogElement;
				const d5 = document.getElementById('d5') as HTMLDialogElement;
				const d6 = document.getElementById('d6') as HTMLDialogElement;
				const d7 = document.getElementById('d7') as HTMLDialogElement;
				const d8 = document.getElementById('d8') as HTMLDialogElement;
				const d9 = document.getElementById('d9') as HTMLDialogElement;
				const d10 = document.getElementById('d10') as HTMLDialogElement;
				const d11 = document.getElementById('d11') as HTMLDialogElement;
				const b0 = document.getElementById('b0') as HTMLButtonElement;
				const b1 = document.getElementById('b1') as HTMLButtonElement;
				const b3 = document.getElementById('b3') as HTMLButtonElement;
				const b4 = document.getElementById('b4') as HTMLButtonElement;
				const b5 = document.getElementById('b5') as HTMLButtonElement;

				d9.showModal();
				cleanup(function () {
					d9.close();
				});
				expect(d9.open).toBe(true);
				d9.removeAttribute('open');
				expect(d9.open).toBe(false);
				d9.showModal();
				expect(d9.open).toBe(true);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'showModal() on a <dialog> not in a Document throws an InvalidStateError exception',
			({ document, cleanup, DOMException }) => {
				const d1 = document.getElementById('d1') as HTMLDialogElement;
				const d2 = document.getElementById('d2') as HTMLDialogElement;
				const d3 = document.getElementById('d3') as HTMLDialogElement;
				const d4 = document.getElementById('d4') as HTMLDialogElement;
				const d5 = document.getElementById('d5') as HTMLDialogElement;
				const d6 = document.getElementById('d6') as HTMLDialogElement;
				const d7 = document.getElementById('d7') as HTMLDialogElement;
				const d8 = document.getElementById('d8') as HTMLDialogElement;
				const d9 = document.getElementById('d9') as HTMLDialogElement;
				const d10 = document.getElementById('d10') as HTMLDialogElement;
				const d11 = document.getElementById('d11') as HTMLDialogElement;
				const b0 = document.getElementById('b0') as HTMLButtonElement;
				const b1 = document.getElementById('b1') as HTMLButtonElement;
				const b3 = document.getElementById('b3') as HTMLButtonElement;
				const b4 = document.getElementById('b4') as HTMLButtonElement;
				const b5 = document.getElementById('b5') as HTMLButtonElement;

				let d = document.createElement('dialog');
				cleanup(function () {
					d.close();
				});
				expect(function () {
					d.showModal();
				}).toThrow(
					expect.objectContaining({
						name: 'InvalidStateError',
						code: 11,
						constructor: DOMException,
					}),
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'when opening multiple dialogs, only the newest one is non-inert',
			({ document, cleanup }) => {
				const d1 = document.getElementById('d1') as HTMLDialogElement;
				const d2 = document.getElementById('d2') as HTMLDialogElement;
				const d3 = document.getElementById('d3') as HTMLDialogElement;
				const d4 = document.getElementById('d4') as HTMLDialogElement;
				const d5 = document.getElementById('d5') as HTMLDialogElement;
				const d6 = document.getElementById('d6') as HTMLDialogElement;
				const d7 = document.getElementById('d7') as HTMLDialogElement;
				const d8 = document.getElementById('d8') as HTMLDialogElement;
				const d9 = document.getElementById('d9') as HTMLDialogElement;
				const d10 = document.getElementById('d10') as HTMLDialogElement;
				const d11 = document.getElementById('d11') as HTMLDialogElement;
				const b0 = document.getElementById('b0') as HTMLButtonElement;
				const b1 = document.getElementById('b1') as HTMLButtonElement;
				const b3 = document.getElementById('b3') as HTMLButtonElement;
				const b4 = document.getElementById('b4') as HTMLButtonElement;
				const b5 = document.getElementById('b5') as HTMLButtonElement;

				expect(d3.open).toBe(false);
				expect(d4.open).toBe(false);
				expect(d5.open).toBe(false);
				d3.showModal();
				cleanup(function () {
					d3.close();
				});
				d4.showModal();
				cleanup(function () {
					d4.close();
				});
				d5.showModal();
				cleanup(function () {
					d5.close();
				});
				expect(d3.open).toBe(true);
				expect(d4.open).toBe(true);
				expect(d5.open).toBe(true);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'When the document is not attached to any pages, showModal() should throw.',
			({ document, DOMException, cleanup }) => {
				const d1 = document.getElementById('d1') as HTMLDialogElement;
				const d2 = document.getElementById('d2') as HTMLDialogElement;
				const d3 = document.getElementById('d3') as HTMLDialogElement;
				const d4 = document.getElementById('d4') as HTMLDialogElement;
				const d5 = document.getElementById('d5') as HTMLDialogElement;
				const d6 = document.getElementById('d6') as HTMLDialogElement;
				const d7 = document.getElementById('d7') as HTMLDialogElement;
				const d8 = document.getElementById('d8') as HTMLDialogElement;
				const d9 = document.getElementById('d9') as HTMLDialogElement;
				const d10 = document.getElementById('d10') as HTMLDialogElement;
				const d11 = document.getElementById('d11') as HTMLDialogElement;
				const b0 = document.getElementById('b0') as HTMLButtonElement;
				const b1 = document.getElementById('b1') as HTMLButtonElement;
				const b3 = document.getElementById('b3') as HTMLButtonElement;
				const b4 = document.getElementById('b4') as HTMLButtonElement;
				const b5 = document.getElementById('b5') as HTMLButtonElement;

				expect(d11.open).toBe(false);
				d11.parentNode!.removeChild(d11);
				expect(() => d11.showModal()).toThrow(
					expect.objectContaining({
						name: 'InvalidStateError',
						code: 11,
						constructor: DOMException,
					}),
				);

				const doc = document.implementation.createHTMLDocument();
				doc.body.appendChild(d11);
				cleanup(() => document.body.append(d11));
				expect(d11.open).toBe(false);
				expect(() => d11.showModal()).toThrow(
					expect.objectContaining({
						name: 'InvalidStateError',
						code: 11,
						constructor: DOMException,
					}),
				);
				expect(d11.open).toBe(false);
			},
			{ document: { contentType: 'text/html', content } },
		);

		context.test(
			'when opening multiple dialogs, the most recently opened is rendered on top',
			({ document, cleanup }) => {
				const d10 = document.getElementById('d10') as HTMLDialogElement;
				const d11 = document.getElementById('d11') as HTMLDialogElement;
				expect(d10.open).toBe(false);
				expect(d11.open).toBe(false);
				d10.showModal();
				cleanup(() => {
					d10.close();
				});
				d11.showModal();
				cleanup(() => {
					d11.close();
				});
				const rect10 = d10.getBoundingClientRect();
				const rect11 = d11.getBoundingClientRect();
				expect(rect10.left).toBe(rect11.left);
				expect(rect10.top).toBe(rect11.top);
				expect(rect10.width).toBe(rect11.width);
				expect(rect10.height).toBe(rect11.height);
				const pointX = rect10.left + rect10.width / 2;
				const pointY = rect10.top + rect10.height / 2;
				function topElement() {
					return document.elementFromPoint(pointX, pointY);
				}
				expect(topElement()).toBe(d11);
				d10.removeAttribute('open');
				expect(topElement()).toBe(d11);
				d10.showModal();
				expect(topElement()).toBe(d10);
				d11.close();
				expect(topElement()).toBe(d10);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
