import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function nextTask() {
		return new Promise<void>((resolve) => setTimeout(resolve, 0));
	}
	context.test(
		'Mutation observers are notified in the order they were created',
		async ({ document, MutationObserver }) => {
			const firstTarget = document.createElement('div');
			const secondTarget = document.createElement('div');
			const order: string[] = [];
			const first = new MutationObserver(() => order.push('first'));
			const second = new MutationObserver(() => order.push('second'));
			first.observe(firstTarget, { attributes: true });
			second.observe(secondTarget, { attributes: true });

			secondTarget.setAttribute('data-test', '');
			firstTarget.setAttribute('data-test', '');
			await nextTask();

			{
				const actual = order;
				const expected = ['first', 'second'];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
	);
	context.test(
		'Mutation observers are notified in the order they were created, also when one observes a removed subtree',
		async ({ document, MutationObserver }) => {
			const parent = document.createElement('div');
			const child = parent.appendChild(document.createElement('div'));
			const order: string[] = [];
			const first = new MutationObserver(() => order.push('first'));
			const second = new MutationObserver(() => order.push('second'));
			first.observe(parent, { childList: true });
			second.observe(parent, { attributes: true, subtree: true });

			// This queues a record for first, while second keeps observing child.
			child.remove();
			child.setAttribute('data-test', '');
			await nextTask();

			{
				const actual = order;
				const expected = ['first', 'second'];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
	);
	context.test(
		'The mutation observer microtask is only queued once a record is queued for an observer',
		async ({ document, MutationObserver }) => {
			const target = document.createElement('div');
			const order: string[] = [];
			const observer = new MutationObserver(() => order.push('observer'));
			observer.observe(target, { attributes: true });

			// No observer gets a record for this mutation, so it does not queue the mutation observer
			// microtask.
			document.createElement('div').append('text');
			Promise.resolve().then(() => order.push('promise'));
			// This queues a record and therefore the mutation observer microtask, after the promise job.
			target.setAttribute('data-test', '');
			await nextTask();

			{
				const actual = order;
				const expected = ['promise', 'observer'];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
	);
}
