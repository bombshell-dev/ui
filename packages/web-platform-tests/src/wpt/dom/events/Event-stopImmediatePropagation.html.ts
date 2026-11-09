import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"Event's stopImmediatePropagation",
		(fixture) => {
			const { document } = fixture;
			const window = document.defaultView!;
			const Event = fixture.Event;
			const target = document.querySelector('#target')!;

			let timesCalled = 0;
			target.addEventListener(
				'test',
				fixture.step((e: Event) => {
					++timesCalled;
					e.stopImmediatePropagation();
					expect(e.cancelBubble, 'The stop propagation flag must have been set').toBe(true);
				}),
			);
			target.addEventListener('test', () => {
				++timesCalled;
			});

			const e = new Event('test');
			target.dispatchEvent(e);
			expect(timesCalled, 'The second listener must not have been called').toBe(1);
		},
		{ document: { contentType: 'text/html', content: '<!doctype html><div id="target"></div>' } },
	);
}
