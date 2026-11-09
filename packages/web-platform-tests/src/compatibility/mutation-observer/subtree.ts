import type { DOMNode as DOMNodeContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'observes descendants only when subtree is enabled and deduplicates overlapping registrations',
		({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const root = document.createElement('div');
			const child = document.createElement('span');
			root.appendChild(child);
			const observer = new MutationObserver(() => {});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(root, { attributes: true });
			child.setAttribute('title', 'unobserved');
			expect(observer.takeRecords()).toEqual([]);
			observer.observe(root, { attributes: true, subtree: true });
			observer.observe(child, { attributes: true, attributeOldValue: true });
			child.setAttribute('title', 'observed');
			const records = observer.takeRecords();
			expect(records.length).toBe(1);
			expect(records[0]?.target).toBe(child);
			expect(records[0]?.oldValue).toBe('unobserved');
		},
	);

	context.test('does not include descendant mutations unless subtree is requested', (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals('MutationObserver'),
			o = new MutationObserver(() => {});
		fixture.cleanup(() => o.disconnect());
		const p = document.createElement('div'),
			child = document.createElement('i');
		p.append(child);
		o.observe(p as unknown as DOMNodeContract, { attributes: true });
		child.setAttribute('x', '1');
		expect(o.takeRecords()).toEqual([]);
		o.observe(p as unknown as DOMNodeContract, { attributes: true, subtree: true });
		child.setAttribute('x', '2');
		expect(o.takeRecords()[0]!.target).toBe(child);
	});
}
