import type { DOMNode as DOMNodeContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'rejects empty or contradictory observation options',
		({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const target = document.createElement('div');
			const observer = new MutationObserver(() => {});
			cleanup(() => {
				observer.disconnect();
			});
			expect(() => observer.observe(target, {})).toThrow(
				expect.objectContaining({ name: 'TypeError' }),
			);
			expect(() =>
				observer.observe(target, { attributes: false, attributeOldValue: true }),
			).toThrow(expect.objectContaining({ name: 'TypeError' }));
			expect(() => observer.observe(target, { attributes: false, attributeFilter: [] })).toThrow(
				expect.objectContaining({ name: 'TypeError' }),
			);
			expect(() =>
				observer.observe(target, { characterData: false, characterDataOldValue: true }),
			).toThrow(expect.objectContaining({ name: 'TypeError' }));
			expect(() => observer.observe(target, { attributeOldValue: true })).not.toThrow();
			expect(() => observer.observe(target, { characterDataOldValue: true })).not.toThrow();
		},
	);
	context.test(
		'replaces options when the same observer observes a target again',
		({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const target = document.createElement('div');
			const observer = new MutationObserver(() => {});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(target, { attributes: true });
			observer.observe(target, { childList: true });
			target.setAttribute('title', 'unobserved');
			const child = document.createElement('span');
			target.appendChild(child);
			const records = observer.takeRecords();
			expect(records.length).toBe(1);
			expect(records[0]?.type).toBe('childList');
			expect(records[0]?.addedNodes[0]).toBe(child);
		},
	);

	context.test(
		'requires a mutation type and rejects contradictory old-value options',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const MutationObserver = fixture.globals('MutationObserver');
			const observer = new MutationObserver(() => {});
			fixture.cleanup(() => observer.disconnect());
			const e = document.createElement('div');
			for (const options of [
				{},
				{ attributes: false, attributeOldValue: true },
				{ characterData: false, characterDataOldValue: true },
				{ attributes: false, attributeFilter: ['x'] },
			])
				expect(() => observer.observe(e as unknown as DOMNodeContract, options)).toThrow(
					expect.objectContaining({ name: 'TypeError' }),
				);
		},
	);

	context.test('implicitly enables attributes when only a filter is supplied', (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals('MutationObserver');
		const observer = new MutationObserver(() => {});
		fixture.cleanup(() => observer.disconnect());
		const e = document.createElement('div');
		observer.observe(e as unknown as DOMNodeContract, { attributeFilter: ['x'] });
		e.setAttribute('x', '1');
		expect(observer.takeRecords().length).toBe(1);
	});
}
