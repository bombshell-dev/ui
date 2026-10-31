import type { DOMNode as DOMNodeContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'records inserted and removed node identities with sibling positions',
		({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const parent = document.createElement('div');
			const first = document.createElement('span');
			const last = document.createElement('span');
			parent.appendChild(first);
			parent.appendChild(last);
			const observer = new MutationObserver(() => {});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(parent, { childList: true });
			const inserted = document.createTextNode('inserted');
			parent.insertBefore(inserted, last);
			parent.removeChild(inserted);
			const records = observer.takeRecords();
			expect(records.length).toBe(2);
			const addition = records[0];
			const removal = records[1];
			expect(addition?.type).toBe('childList');
			expect(addition?.target).toBe(parent);
			expect(addition?.addedNodes.length).toBe(1);
			expect(addition?.addedNodes[0]).toBe(inserted);
			expect(addition?.removedNodes.length).toBe(0);
			expect(addition?.previousSibling).toBe(first);
			expect(addition?.nextSibling).toBe(last);
			expect(addition?.attributeName).toBeNull();
			expect(addition?.attributeNamespace).toBeNull();
			expect(addition?.oldValue).toBeNull();
			expect(removal?.addedNodes.length).toBe(0);
			expect(removal?.removedNodes.length).toBe(1);
			expect(removal?.removedNodes[0]).toBe(inserted);
			expect(removal?.previousSibling).toBe(first);
			expect(removal?.nextSibling).toBe(last);
		},
	);

	context.test('records sibling anchors and groups fragment insertion', (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals('MutationObserver');
		const o = new MutationObserver(() => {});
		fixture.cleanup(() => o.disconnect());
		const p = document.createElement('div'),
			a = document.createElement('i'),
			b = document.createElement('b'),
			f = document.createDocumentFragment();
		p.append(a, b);
		o.observe(p as unknown as DOMNodeContract, { childList: true });
		const x = document.createElement('u'),
			y = document.createTextNode('y');
		f.append(x, y);
		p.insertBefore(f, b);
		const records = o.takeRecords();
		expect(records.length).toBe(1);
		expect(Array.from(records[0]!.addedNodes)).toEqual([x, y]);
		expect(records[0]!.previousSibling).toBe(a);
		expect(records[0]!.nextSibling).toBe(b);
	});
}
