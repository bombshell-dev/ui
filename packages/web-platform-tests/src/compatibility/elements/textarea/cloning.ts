import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element';
const requiredGlobals = ['HTMLTextAreaElement'] as const;
export { requiredGlobals as globals };
export const requires = ['elements.textarea.value', 'node.cloning'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('copies dirty value independently of the source', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('textarea');
		element.defaultValue = 'original';
		element.value = 'edited';
		const clone = element.cloneNode(true);
		const Constructor = fixture.globals('HTMLTextAreaElement');
		if (!(clone instanceof Constructor)) return expect.unreachable('Unexpected clone interface');
		expect(clone.value).toBe('edited');
		expect(clone.defaultValue).toBe('original');
		clone.defaultValue = 'new default';
		expect(clone.value).toBe('edited');
		clone.value = 'independent';
		expect(element.value).toBe('edited');
	});

	context.test('clones dirty value and text defaults independently', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('textarea');
		e.defaultValue = 'default';
		e.value = 'dirty';
		const copy = e.cloneNode(true) as HTMLTextAreaElement;
		expect(copy.value).toBe('dirty');
		expect(copy.defaultValue).toBe('default');
		copy.value = 'changed';
		expect(e.value).toBe('dirty');
	});
}
