import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const content = `<!doctype html>
<meta charset="utf-8">
<title>dialog element: open</title>



<dialog id="d1">
  <p>foobar</p>
  <button>OK</button>
</dialog>
<dialog id="d2" open>
  <p>foobar</p>
  <button>OK</button>
</dialog>

`;

		context.test(
			'On getting, the IDL open attribute must return true if the content open attribute is set, and false if it is absent.',
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

				expect(d1.open).toBe(false);
				expect(d2.open).toBe(true);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'On setting, the content open attribute must be removed if the IDL open attribute is set to false, and must be present if the IDL open attribute is set to true.',
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

				d1.open = true;
				expect(d1.hasAttribute('open')).toBe(true);
				d2.open = false;
				expect(d2.hasAttribute('open')).toBe(false);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
