import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('calls `handleEvent` method of `EventListener`', ({ document, Event, step }) => {
		const type = 'foo';
		const target = document.createElement('div');
		const eventListener = {
			handleEvent: function (evt: Event) {
				const that = this;
				step(() => {
					expect(evt.type).toBe(type);
					expect(evt.target).toBe(target);
					expect(evt.srcElement).toBe(target);
					expect(that).toBe(eventListener);
				})();
			},
		};

		target.addEventListener(type, eventListener);
		target.dispatchEvent(new Event(type));
	});

	context.test('performs `Get` every time event is dispatched', ({ document, Event }) => {
		const type = 'foo';
		const target = document.createElement('div');
		let calls = 0;

		target.addEventListener(type, {
			get handleEvent() {
				calls++;
				return function () {};
			},
		});

		expect(calls).toBe(0);
		target.dispatchEvent(new Event(type));
		target.dispatchEvent(new Event(type));
		expect(calls).toBe(2);
	});

	context.test(
		"doesn't call `handleEvent` method on callable `EventListener`",
		({ document, Event, step }) => {
			const type = 'foo';
			const target = document.createElement('div');
			let calls = 0;
			const eventListener = function () {
				calls++;
			};
			eventListener.handleEvent = step(() => {
				expect.unreachable('`handleEvent` method should not be called on functions');
			});

			target.addEventListener(type, eventListener);
			target.dispatchEvent(new Event(type));
			expect(calls).toBe(1);
		},
	);
}
