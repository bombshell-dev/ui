import type { DOMNode as DOMNodeContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'records text and comment data mutations without old values by default',
		({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const text = document.createTextNode('before');
			const comment = document.createComment('before');
			const observer = new MutationObserver(() => {});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(text, { characterData: true });
			observer.observe(comment, { characterData: true });
			text.data = 'after';
			comment.data = 'after';
			const records = observer.takeRecords();
			expect(records.length).toBe(2);
			expect(records[0]?.target).toBe(text);
			expect(records[1]?.target).toBe(comment);
			for (const record of records) {
				expect(record.type).toBe('characterData');
				expect(record.oldValue).toBeNull();
				expect(record.addedNodes.length).toBe(0);
				expect(record.removedNodes.length).toBe(0);
				expect(record.attributeName).toBeNull();
				expect(record.attributeNamespace).toBeNull();
			}
		},
	);

	context.test('reports each edit with previous data and null attribute fields', (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals('MutationObserver'),
			o = new MutationObserver(() => {});
		fixture.cleanup(() => o.disconnect());
		const t = document.createTextNode('abc');
		o.observe(t as unknown as DOMNodeContract, {
			characterData: true,
			characterDataOldValue: true,
		});
		t.appendData('d');
		t.deleteData(0, 1);
		const records = o.takeRecords();
		expect(records.map((r) => r.oldValue)).toEqual(['abc', 'abcd']);
		expect(records[0]!.attributeName).toBeNull();
		expect(records[0]!.attributeNamespace).toBeNull();
		expect(records[0]!.previousSibling).toBeNull();
		expect(records[0]!.target).toBe(t);
	});
}
