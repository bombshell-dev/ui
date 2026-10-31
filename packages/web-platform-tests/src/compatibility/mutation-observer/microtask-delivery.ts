import type { DOMNode as DOMNodeContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'batches records into a microtask and supplies the observer as receiver and argument',
		async ({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const target = document.createElement('div');
			const deliveries: (string | null)[][] = [];
			const receivers: unknown[] = [];
			const arguments_: unknown[] = [];
			const observer = new MutationObserver(function (records, suppliedObserver) {
				receivers.push(this);
				arguments_.push(suppliedObserver);
				deliveries.push(
					records.map((record) => {
						return record.attributeName;
					}),
				);
			});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(target, { attributes: true });
			target.setAttribute('id', 'one');
			target.setAttribute('title', 'two');
			expect(deliveries).toEqual([]);
			await Promise.resolve();
			expect(deliveries).toEqual([['id', 'title']]);
			expect(receivers[0]).toBe(observer);
			expect(arguments_[0]).toBe(observer);
			expect(observer.takeRecords()).toEqual([]);
		},
	);

	context.test(
		'batches synchronous mutations and delivers before a later queued microtask',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const MutationObserver = fixture.globals('MutationObserver');
			const seen: string[] = [];
			const o = new MutationObserver((records) => seen.push('observer:' + records.length));
			fixture.cleanup(() => o.disconnect());
			const e = document.createElement('div');
			o.observe(e as unknown as DOMNodeContract, { attributes: true });
			e.setAttribute('x', '1');
			e.setAttribute('y', '2');
			queueMicrotask(() => seen.push('microtask'));
			expect(seen).toEqual([]);
			await new Promise<void>((resolve) => queueMicrotask(resolve));
			expect(seen).toEqual(['observer:2', 'microtask']);
		},
	);
}
