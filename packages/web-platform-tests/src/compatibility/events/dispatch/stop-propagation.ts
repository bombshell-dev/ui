import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'stops subsequent ancestors while preserving remaining listeners on the same invocation target',
		({ document, globals }) => {
			const Event = globals('Event');
			const parent = document.createElement('div');
			const target = document.createElement('div');
			parent.appendChild(target);
			const calls: string[] = [];
			target.addEventListener('probe', (event) => {
				calls.push('first');
				event.stopPropagation();
			});
			target.addEventListener('probe', () => {
				calls.push('second');
			});
			parent.addEventListener('probe', () => {
				calls.push('parent');
			});
			expect(target.dispatchEvent(new Event('probe', { bubbles: true, cancelable: true }))).toBe(
				true,
			);
			expect(calls).toEqual(['first', 'second']);
		},
		['events.dispatch.bubbling'],
	);
	context.test('resets a stop flag at the end of dispatch', ({ document, globals }) => {
		const Event = globals('Event');
		const target = document.createElement('div');
		const event = new Event('probe');
		let calls = 0;
		target.addEventListener('probe', (received) => {
			calls++;
			received.stopPropagation();
		});
		target.dispatchEvent(event);
		target.dispatchEvent(event);
		expect(calls).toBe(2);
	});
	context.test(
		'honors a stop flag set before dispatch and clears it afterward',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const event = new Event('probe');
			let calls = 0;
			target.addEventListener('probe', () => {
				calls++;
			});
			event.stopPropagation();
			target.dispatchEvent(event);
			expect(calls).toBe(0);
			target.dispatchEvent(event);
			expect(calls).toBe(1);
		},
	);
	context.test(
		'stops between target capture and target non-capture invocations',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const calls: string[] = [];
			target.addEventListener(
				'probe',
				(event) => {
					calls.push('capture first');
					event.stopPropagation();
				},
				true,
			);
			target.addEventListener(
				'probe',
				() => {
					calls.push('capture second');
				},
				true,
			);
			target.addEventListener('probe', () => {
				calls.push('non-capture');
			});
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual(['capture first', 'capture second']);
		},
		['events.dispatch.capture'],
	);
	context.test(
		'stops before reaching the target when an ancestor capture listener requests it',
		({ document, globals }) => {
			const Event = globals('Event');
			const parent = document.createElement('div');
			const target = document.createElement('div');
			parent.appendChild(target);
			const calls: string[] = [];
			parent.addEventListener(
				'probe',
				(event) => {
					calls.push('parent');
					event.stopPropagation();
				},
				true,
			);
			target.addEventListener(
				'probe',
				() => {
					calls.push('target capture');
				},
				true,
			);
			target.addEventListener('probe', () => {
				calls.push('target non-capture');
			});
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual(['parent']);
		},
		['events.dispatch.capture'],
	);
}
