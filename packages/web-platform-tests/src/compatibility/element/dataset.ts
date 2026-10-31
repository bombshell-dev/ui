import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/dom.html#dom-dataset';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('maps names and synchronizes attributes in both directions', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		const data = e.dataset;
		e.setAttribute('data-long-name', 'one');
		expect(data.longName).toBe('one');
		data.longName = 'two';
		expect(e.getAttribute('data-long-name')).toBe('two');
		delete data.longName;
		expect(e.hasAttribute('data-long-name')).toBe(false);
		expect(e.dataset).toBe(data);
	});
	context.test('coerces values and rejects ambiguous dashed property names', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		Reflect.set(e.dataset, 'x', null);
		expect(e.dataset.x).toBe('null');
		expect(() => {
			e.dataset['bad-name'] = 'x';
		}).toThrow(expect.objectContaining({ name: 'SyntaxError' }));
		e.setAttribute('data-a-1', 'n');
		expect(e.dataset['a-1']).toBe('n');
		expect(Object.keys(e.dataset)).toEqual(['x', 'a-1']);
	});
}
