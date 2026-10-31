import type { DOMNode as DOMNodeContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

const requiredGlobals = ['MutationObserver'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#mutation-observers';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'captures prior attribute and character-data values in mutation order',
		({ document, globals, cleanup }) => {
			const MutationObserver = globals('MutationObserver');
			const target = document.createElement('div');
			const text = document.createTextNode('a');
			const observer = new MutationObserver(() => {});
			cleanup(() => {
				observer.disconnect();
			});
			observer.observe(target, { attributeOldValue: true });
			observer.observe(text, { characterDataOldValue: true });
			target.setAttribute('title', 'one');
			target.setAttribute('title', 'two');
			target.removeAttribute('title');
			text.data = 'b';
			text.data = 'c';
			expect(
				observer.takeRecords().map((record) => {
					return record.oldValue;
				}),
			).toEqual([null, 'one', 'two', 'a', 'b']);
		},
	);

	context.test('records each prior value including null and repeated assignments', (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals('MutationObserver');
		const observer = new MutationObserver(() => {});
		fixture.cleanup(() => observer.disconnect());
		const e = document.createElement('div');
		observer.observe(e as unknown as DOMNodeContract, {
			attributes: true,
			attributeOldValue: true,
		});
		e.setAttribute('x', 'a');
		e.setAttribute('x', 'a');
		e.removeAttribute('x');
		expect(observer.takeRecords().map((r) => r.oldValue)).toEqual([null, 'a', 'a']);
	});
}
