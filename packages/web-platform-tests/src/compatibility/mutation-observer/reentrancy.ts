import type { DOMNode as DOMNodeContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const requires = ['mutationObserver.microtaskDelivery'] as const;
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'queues callback mutations for another notification',
		async ({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const target = document.createElement('div');
			const deliveries: string[][] = [];
			let inCallback = false;
			let reentered = false;
			const observer = new MutationObserver((records) => {
				if (inCallback) reentered = true;
				inCallback = true;
				deliveries.push(
					records.map((record) => {
						return record.attributeName ?? '';
					}),
				);
				if (deliveries.length === 1) target.setAttribute('title', 'second');
				inCallback = false;
			});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(target, { attributes: true });
			target.setAttribute('id', 'first');
			await Promise.resolve();
			await Promise.resolve();
			expect(deliveries).toEqual([['id'], ['title']]);
			expect(reentered).toBe(false);
		},
	);

	context.test('delivers callback-generated mutations in a later notification', async (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals('MutationObserver'),
			e = document.createElement('div'),
			seen: number[] = [];
		const o = new MutationObserver((records) => {
			seen.push(records.length);
			if (seen.length === 1) e.setAttribute('y', '2');
		});
		fixture.cleanup(() => o.disconnect());
		o.observe(e as unknown as DOMNodeContract, { attributes: true });
		e.setAttribute('x', '1');
		await new Promise<void>((resolve) => setTimeout(resolve, 0));
		expect(seen).toEqual([1, 1]);
	});
}
