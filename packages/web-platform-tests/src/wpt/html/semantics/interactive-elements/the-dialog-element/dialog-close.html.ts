import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const content = `<!DOCTYPE html>
<meta charset=utf-8>
<title>dialog element: close()</title>




<div id="log"></div>
<dialog id="d1">
  <p>foobar</p>
  <button>OK</button>
</dialog>
<dialog id="d2" open>
  <p>foobar</p>
  <button>OK</button>
</dialog>
<dialog id="d3" open>
  <p>foobar</p>
  <button>OK</button>
</dialog>
<dialog id="d4" open>
  <p>foobar</p>
  <button>OK</button>
</dialog>
<dialog id="d5" open>
  <p>foobar</p>
  <button>OK</button>
</dialog>

`;

		context.test(
			"close() on a <dialog> that doesn't have an open attribute aborts the steps",
			({ document }) => {
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

				d1.close('closedialog');
				expect(d1.returnValue).toBe('');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'close() removes the open attribute and set the returnValue to the first argument',
			({ document }) => {
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

				expect(d2.open).toBe(true);
				expect(d2.returnValue).toBe('');
				d2.close('closedialog');
				expect(d2.hasAttribute('open')).toBe(false);
				expect(d2.returnValue).toBe('closedialog');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			"close() without argument removes the open attribute and there's no returnValue",
			({ document }) => {
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

				expect(d3.open).toBe(true);
				expect(d3.returnValue).toBe('');
				d3.returnValue = 'foobar';
				d3.close();
				expect(d3.hasAttribute('open')).toBe(false);
				expect(d3.returnValue).toBe('foobar');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'close() should set the returnValue IDL attribute but not the JS property',
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
				const HTMLDialogElement = fixture.HTMLDialogElement;
				const descriptor = Object.getOwnPropertyDescriptor(
					HTMLDialogElement.prototype,
					'returnValue',
				)!;
				fixture.cleanup(() => {
					Object.defineProperty(HTMLDialogElement.prototype, 'returnValue', descriptor);
				});

				Object.defineProperty(HTMLDialogElement.prototype, 'returnValue', {
					set: function (v: unknown) {
						expect.unreachable('JS-defined setter returnValue on the prototype was invoked');
					},
					configurable: true,
				});
				Object.defineProperty(d5, 'returnValue', {
					set: function (v: unknown) {
						expect.unreachable('JS-defined setter returnValue on the instance was invoked');
					},
					configurable: true,
				});
				d5.close('foo');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'close() fires a close event',
			async ({ document, step }) => {
				const d4 = document.getElementById('d4') as HTMLDialogElement;
				let was_queued = false;
				await new Promise<void>((resolve) => {
					d4.onclose = (e) => {
						step(() => {
							expect(was_queued, 'close event should be queued').toBe(true);
							expect(e.isTrusted, 'close event is trusted').toBe(true);
							expect(e.bubbles, "close event doesn't bubble").toBe(false);
							expect(e.cancelable, 'close event is not cancelable').toBe(false);
						})();
						resolve();
					};
					d4.close();
					was_queued = true;
				});
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
