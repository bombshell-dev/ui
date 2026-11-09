import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.cancellation'] as const;
export const spec = 'https://dom.spec.whatwg.org/#set-the-canceled-flag';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/master/dom/events/AddEventListenerOptions-passive.any.js';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'prevents cancellation only while invoking a passive listener',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const prevented: boolean[] = [];
			target.addEventListener(
				'probe',
				(event) => {
					event.preventDefault();
					prevented.push(event.defaultPrevented);
				},
				{ passive: true },
			);
			target.addEventListener(
				'probe',
				(event) => {
					event.preventDefault();
					prevented.push(event.defaultPrevented);
				},
				{ passive: false },
			);
			expect(target.dispatchEvent(new Event('probe', { cancelable: true }))).toBe(false);
			expect(prevented).toEqual([false, true]);
		},
	);

	context.test('passive listeners cannot cancel but ordinary listeners still can', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		const Event = fixture.globals('Event'),
			seen: boolean[] = [];
		e.addEventListener(
			'x',
			(ev) => {
				ev.preventDefault();
				seen.push(ev.defaultPrevented);
			},
			{ passive: true },
		);
		e.addEventListener('x', (ev) => {
			ev.preventDefault();
			seen.push(ev.defaultPrevented);
		});
		const event = new Event('x', { cancelable: true });
		expect(e.dispatchEvent(event as unknown as Event)).toBe(false);
		expect(seen).toEqual([false, true]);
	});

	context.test('passive listeners can still stop propagation', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('i');
		p.append(e);
		let count = 0;
		e.addEventListener('x', (ev) => ev.stopPropagation(), { passive: true });
		p.addEventListener('x', () => count++);
		const Event = fixture.globals('Event');
		e.dispatchEvent(new Event('x', { bubbles: true }) as unknown as Event);
		expect(count).toBe(0);
	});
}
