import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/input.html#the-input-element';
const requiredGlobals = ['HTMLInputElement'] as const;
export { requiredGlobals as globals };
export const requires = ['elements.input.value', 'node.cloning'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('copies dirty value independently of the source', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('input');
		element.defaultValue = 'original';
		element.value = 'edited';
		const clone = element.cloneNode(true);
		const Constructor = fixture.globals('HTMLInputElement');
		if (!(clone instanceof Constructor)) return expect.unreachable('Unexpected clone interface');
		expect(clone.value).toBe('edited');
		expect(clone.defaultValue).toBe('original');
		clone.defaultValue = 'new default';
		expect(clone.value).toBe('edited');
		clone.value = 'independent';
		expect(element.value).toBe('edited');
	});

	context.test('clones dirty value without sharing subsequent edits', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.defaultValue = 'default';
		e.value = 'dirty';
		const copy = e.cloneNode(true) as HTMLInputElement;
		expect(copy.value).toBe('dirty');
		expect(copy.defaultValue).toBe('default');
		copy.value = 'changed';
		expect(e.value).toBe('dirty');
	});

	context.test('clones checkedness separately from defaultChecked', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.type = 'checkbox';
		e.defaultChecked = true;
		e.checked = false;
		const copy = e.cloneNode() as HTMLInputElement;
		expect(copy.defaultChecked).toBe(true);
		expect(copy.checked).toBe(false);
		copy.checked = true;
		expect(e.checked).toBe(false);
	});
}
