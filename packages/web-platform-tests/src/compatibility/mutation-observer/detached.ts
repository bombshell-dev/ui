import type { CompatibilityContext } from '../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const requires = ['mutationObserver.subtree', 'mutationObserver.microtaskDelivery'] as const;
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'observes an explicitly targeted detached node',
		({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const target = document.createElement('div');
			const observer = new MutationObserver(() => {});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(target, { attributes: true });
			target.setAttribute('title', 'detached');
			const [record] = observer.takeRecords();
			expect(record?.target).toBe(target);
		},
	);
	context.test(
		'tracks a removed descendant until the removal notification microtask',
		async ({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const root = document.createElement('div');
			const child = document.createElement('span');
			root.appendChild(child);
			const delivered: string[][] = [];
			const observer = new MutationObserver((records) => {
				delivered.push(
					records.map((record) => {
						return record.type;
					}),
				);
			});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(root, { childList: true, attributes: true, subtree: true });
			root.removeChild(child);
			child.setAttribute('title', 'still observed');
			await Promise.resolve();
			expect(delivered).toEqual([['childList', 'attributes']]);
			child.setAttribute('title', 'no longer observed');
			await Promise.resolve();
			expect(delivered).toEqual([['childList', 'attributes']]);
		},
	);
}
