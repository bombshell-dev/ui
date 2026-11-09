import type { DOMNode as DOMNodeContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'drains pending records without invoking the callback',
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
			target.setAttribute('id', 'one');
			const records = observer.takeRecords();
			expect(records.length).toBe(1);
			expect(records[0]?.attributeName).toBe('id');
			expect(observer.takeRecords()).toEqual([]);
			await Promise.resolve();
			expect(callbacks).toBe(0);
		},
	);

	context.test('drains only the calling observer and preserves record identity', (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals('MutationObserver');
		const a = new MutationObserver(() => {}),
			b = new MutationObserver(() => {});
		fixture.cleanup(() => {
			a.disconnect();
			b.disconnect();
		});
		const e = document.createElement('div');
		a.observe(e as unknown as DOMNodeContract, { attributes: true });
		b.observe(e as unknown as DOMNodeContract, { attributes: true });
		e.setAttribute('x', '1');
		const first = a.takeRecords();
		expect(first.length).toBe(1);
		expect(a.takeRecords()).toEqual([]);
		expect(b.takeRecords().length).toBe(1);
		expect(first[0]!.target).toBe(e);
	});
}
