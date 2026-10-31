import type { DOMNode as DOMNodeContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'records attribute names, namespaces, and mutations that repeat a value',
		({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const target = document.createElement('div');
			const observer = new MutationObserver(() => {});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(target, { attributes: true });
			target.setAttribute('title', 'one');
			target.setAttribute('title', 'one');
			target.removeAttribute('title');
			target.setAttributeNS('urn:compatibility', 'x:flag', 'yes');
			const records = observer.takeRecords();
			expect(records.length).toBe(4);
			expect(
				records.map((record) => {
					return record.attributeName;
				}),
			).toEqual(['title', 'title', 'title', 'flag']);
			expect(
				records.map((record) => {
					return record.attributeNamespace;
				}),
			).toEqual([null, null, null, 'urn:compatibility']);
			for (const record of records) {
				expect(record.type).toBe('attributes');
				expect(record.target).toBe(target);
				expect(record.addedNodes.length).toBe(0);
				expect(record.removedNodes.length).toBe(0);
				expect(record.previousSibling).toBeNull();
				expect(record.nextSibling).toBeNull();
				expect(record.oldValue).toBeNull();
			}
		},
	);

	context.test('records namespace and local name independently of prefix', (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals('MutationObserver'),
			o = new MutationObserver(() => {});
		fixture.cleanup(() => o.disconnect());
		const e = document.createElement('div');
		o.observe(e as unknown as DOMNodeContract, { attributes: true, attributeOldValue: true });
		e.setAttributeNS('urn:x', 'p:name', 'a');
		e.setAttributeNS('urn:x', 'q:name', 'b');
		const records = o.takeRecords();
		expect(records.map((r) => [r.type, r.attributeName, r.attributeNamespace, r.oldValue])).toEqual(
			[
				['attributes', 'name', 'urn:x', null],
				['attributes', 'name', 'urn:x', 'a'],
			],
		);
		expect(records[0]!.addedNodes.length).toBe(0);
		expect(records[0]!.removedNodes.length).toBe(0);
	});
}
