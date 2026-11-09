import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Calling observe in callback should not lead to more calls',
		async ({ document, MutationObserver }) => {
			let called = 0;
			const div1 = document.createElement('div');
			document.body.appendChild(div1);
			const m = new MutationObserver(() => {
				called++;
				const div2 = document.createElement('div');
				document.body.appendChild(div2);
				m.observe(div2, { attributes: true });
			});
			m.observe(div1, { attributes: true });
			div1.setAttribute('data-test', 'test');
			return Promise.resolve().then(() => {
				expect(called, 'times callback called').toBe(1);
			});
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<meta charset=utf-8>\n<title>Certain actions within the callback does not lead to infinite loop</title>\n\n\n<body>\n\n',
			},
		},
	);
	context.test(
		'Disconnect and re-observe in callback should not lead to more calls',
		async ({ document, MutationObserver }) => {
			let called = 0;
			const div1 = document.createElement('div');
			document.body.appendChild(div1);
			const m = new MutationObserver(() => {
				called++;
				m.disconnect();
				m.observe(div1, { attributes: true });
			});
			m.observe(div1, { attributes: true });
			div1.setAttribute('data-test', 'test');
			return Promise.resolve().then(() => {
				expect(called, 'times callback called').toBe(1);
			});
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<meta charset=utf-8>\n<title>Certain actions within the callback does not lead to infinite loop</title>\n\n\n<body>\n\n',
			},
		},
	);
}
