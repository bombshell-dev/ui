import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Default prevention via preventDefault',
		({ document, step }) => {
			const window = document.defaultView!;

			let EVENT = 'foo';
			let TARGET = document.getElementById('target')!;
			let evt = document.createEvent('Event');
			evt.initEvent(EVENT, true, true);

			TARGET.addEventListener(
				EVENT,
				step(function (e: Event) {
					e.preventDefault();
					expect(e.defaultPrevented, 'during dispatch').toBe(true);
				}),
				true,
			);
			TARGET.dispatchEvent(evt);

			expect(evt.defaultPrevented, 'after dispatch').toBe(true);
			expect(evt.target).toBe(TARGET);
			expect(evt.srcElement).toBe(TARGET);
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html><div id="log"></div><input id="target" type="hidden" value=""/>',
			},
		},
	);
	context.test(
		'Default prevention via returnValue',
		({ document, step }) => {
			const window = document.defaultView!;

			let EVENT = 'foo';
			let TARGET = document.getElementById('target')!;
			let evt = document.createEvent('Event');
			evt.initEvent(EVENT, true, true);

			TARGET.addEventListener(
				EVENT,
				step(function (e: Event) {
					e.returnValue = false;
					expect(e.defaultPrevented, 'during dispatch').toBe(true);
				}),
				true,
			);
			TARGET.dispatchEvent(evt);

			expect(evt.defaultPrevented, 'after dispatch').toBe(true);
			expect(evt.target).toBe(TARGET);
			expect(evt.srcElement).toBe(TARGET);
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html><div id="log"></div><input id="target" type="hidden" value=""/>',
			},
		},
	);
}
