import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Split text after end of data', ({ document, DOMException }) => {
		let text = document.createTextNode('camembert');
		expect(function () {
			text.splitText(10);
		}).toThrow(
			expect.objectContaining({
				name: 'IndexSizeError',
				code: 1,
				constructor: DOMException,
			}),
		);
	});
	context.test('Split empty text', ({ document }) => {
		let text = document.createTextNode('');
		let new_text = text.splitText(0);
		expect(text.data).toBe('');
		expect(new_text.data).toBe('');
	});
	context.test('Split text at beginning', ({ document }) => {
		let text = document.createTextNode('comté');
		let new_text = text.splitText(0);
		expect(text.data).toBe('');
		expect(new_text.data).toBe('comté');
	});
	context.test('Split text at end', ({ document }) => {
		let text = document.createTextNode('comté');
		let new_text = text.splitText(5);
		expect(text.data).toBe('comté');
		expect(new_text.data).toBe('');
	});
	context.test('Split root', ({ document }) => {
		let text = document.createTextNode('comté');
		let new_text = text.splitText(3);
		expect(text.data).toBe('com');
		expect(new_text.data).toBe('té');
		expect(new_text.parentNode).toBe(null);
	});
	context.test('Split child', ({ document }) => {
		let parent = document.createElement('div');
		let text = document.createTextNode('bleu');
		parent.appendChild(text);
		let new_text = text.splitText(2);
		expect(text.data).toBe('bl');
		expect(new_text.data).toBe('eu');
		expect(text.nextSibling).toBe(new_text);
		expect(new_text.parentNode).toBe(parent);
	});
}
