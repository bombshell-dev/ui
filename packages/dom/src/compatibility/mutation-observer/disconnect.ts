import type { DOMNode as DOMNodeContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'discards pending records and allows later re-observation',
		async ({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const target = document.createElement('div');
			let callbacks = 0;
			const observer = new MutationObserver(() => {
				callbacks++;
			});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(target, { attributes: true });
			target.setAttribute('id', 'pending');
			observer.disconnect();
			expect(observer.takeRecords()).toEqual([]);
			target.setAttribute('id', 'unobserved');
			await Promise.resolve();
			expect(callbacks).toBe(0);
			observer.observe(target, { attributes: true });
			target.setAttribute('id', 'observed again');
			expect(observer.takeRecords().length).toBe(1);
		},
	);

	context.test('discards queued records and permits subsequent observation', (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals('MutationObserver');
		const o = new MutationObserver(() => {});
		fixture.cleanup(() => o.disconnect());
		const e = document.createElement('div');
		o.observe(e as unknown as DOMNodeContract, { attributes: true });
		e.setAttribute('x', '1');
		o.disconnect();
		expect(o.takeRecords()).toEqual([]);
		e.setAttribute('x', '2');
		expect(o.takeRecords()).toEqual([]);
		o.observe(e as unknown as DOMNodeContract, { attributes: true });
		e.setAttribute('x', '3');
		expect(o.takeRecords().length).toBe(1);
	});
}
