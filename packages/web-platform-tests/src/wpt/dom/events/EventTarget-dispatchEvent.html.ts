import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		context.test(
			'Capturing event listeners should be called before non-capturing ones',
			({ document, Event, step }) => {
				let results: (number | string)[] = [];
				let b = document.createElement('b');
				b.addEventListener(
					'x',
					step(function () {
						results.push(1);
					}),
					true,
				);
				b.addEventListener(
					'x',
					step(function () {
						results.push(2);
					}),
					false,
				);
				b.addEventListener(
					'x',
					step(function () {
						results.push(3);
					}),
					true,
				);
				b.dispatchEvent(new Event('x'));
				expect(results).toHaveLength(3);
				expect(results[0]).toBe(1);
				expect(results[1]).toBe(3);
				expect(results[2]).toBe(2);
			},
		);
	}
	{
		const { expect } = context.runner;
		context.test(
			"If the event's dispatch flag is set, an InvalidStateError must be thrown.",
			({ document, step, DOMException }) => {
				let e = document.createEvent('Event');
				e.initEvent('type', false, false);

				let target = document.createElement('div');
				target.addEventListener(
					'type',
					step(function () {
						expect(function () {
							target.dispatchEvent(e);
						}).toThrow(
							expect.objectContaining({
								name: 'InvalidStateError',
								code: 11,
								constructor: DOMException,
							}),
						);
						expect(function () {
							document.dispatchEvent(e);
						}).toThrow(
							expect.objectContaining({
								name: 'InvalidStateError',
								code: 11,
								constructor: DOMException,
							}),
						);
					}),
					false,
				);

				expect(target.dispatchEvent(e), 'dispatchEvent must return true').toBe(true);
			},
		);
	}
	{
		const { expect } = context.runner;
		context.test(
			'Event listeners added during dispatch should be called',
			({ document, Event, step }) => {
				let results: (number | string)[] = [];
				let outerb = document.createElement('b');
				let middleb = outerb.appendChild(document.createElement('b'));
				let innerb = middleb.appendChild(document.createElement('b'));
				outerb.addEventListener(
					'x',
					step(function () {
						middleb.addEventListener(
							'x',
							step(function () {
								results.push('middle');
							}),
							true,
						);
						results.push('outer');
					}),
					true,
				);
				innerb.dispatchEvent(new Event('x'));
				expect(results).toHaveLength(2);
				expect(results[0]).toBe('outer');
				expect(results[1]).toBe('middle');
			},
		);
	}
}
