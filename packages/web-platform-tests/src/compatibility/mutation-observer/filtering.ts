import type { DOMNode as DOMNodeContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'filters by exact local name and excludes namespaced attributes',
		({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const target = document.createElement('div');
			const observer = new MutationObserver(() => {});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(target, { attributeFilter: ['title'] });
			target.setAttribute('id', 'ignored');
			target.setAttribute('title', 'observed');
			target.setAttributeNS('urn:compatibility', 'x:title', 'ignored');
			expect(
				observer.takeRecords().map((record) => {
					return record.attributeName;
				}),
			).toEqual(['title']);
			observer.observe(target, { attributeFilter: [] });
			target.setAttribute('title', 'ignored');
			expect(observer.takeRecords()).toEqual([]);
		},
	);

	context.test(
		'matches attribute filters exactly and excludes namespaced attributes',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const MutationObserver = fixture.globals('MutationObserver');
			const observer = new MutationObserver(() => {});
			fixture.cleanup(() => observer.disconnect());
			const e = document.createElement('div');
			observer.observe(e as unknown as DOMNodeContract, {
				attributes: true,
				attributeFilter: ['x'],
			});
			e.setAttribute('y', 'a');
			e.setAttributeNS('urn:test', 'p:x', 'b');
			e.setAttribute('x', 'c');
			const records = observer.takeRecords();
			expect(records.length).toBe(1);
			expect(records[0]!.attributeName).toBe('x');
			expect(records[0]!.attributeNamespace).toBeNull();
		},
	);
}
