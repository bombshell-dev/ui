import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target', 'events.listeners.registration'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-listener-invoke';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'removals take effect immediately and additions do not enter an active invocation',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const calls: string[] = [];
			let first = true;
			const removed = (): void => {
				calls.push('removed');
			};
			const added = (): void => {
				calls.push('added');
			};
			target.addEventListener('probe', () => {
				calls.push('first');
				if (first) {
					first = false;
					target.removeEventListener('probe', removed);
					target.addEventListener('probe', removed);
					target.addEventListener('probe', added);
				}
			});
			target.addEventListener('probe', removed);
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual(['first']);
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual(['first', 'first', 'removed', 'added']);
		},
	);
	context.test(
		'takes a fresh snapshot for the target non-capture invocation',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const calls: string[] = [];
			target.addEventListener(
				'probe',
				() => {
					calls.push('capture');
					target.addEventListener('probe', () => {
						calls.push('added non-capture');
					});
					target.addEventListener(
						'probe',
						() => {
							calls.push('added capture');
						},
						true,
					);
				},
				true,
			);
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual(['capture', 'added non-capture']);
		},
		['events.dispatch.capture'],
	);
	context.test(
		'permits listeners added before a later ancestor invocation',
		({ document, globals }) => {
			const Event = globals('Event');
			const parent = document.createElement('div');
			const target = document.createElement('div');
			parent.appendChild(target);
			const calls: string[] = [];
			target.addEventListener('probe', () => {
				parent.addEventListener('probe', () => {
					calls.push('new ancestor listener');
				});
			});
			target.dispatchEvent(new Event('probe', { bubbles: true }));
			expect(calls).toEqual(['new ancestor listener']);
		},
		['events.dispatch.bubbling'],
	);

	context.test('removal before a listener turn prevents its invocation', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		const seen: string[] = [];
		const second = (): number => seen.push('second');
		e.addEventListener('x', () => {
			seen.push('first');
			e.removeEventListener('x', second);
		});
		e.addEventListener('x', second);
		const Event = fixture.globals('Event');
		e.dispatchEvent(new Event('x') as unknown as Event);
		expect(seen).toEqual(['first']);
	});
}
