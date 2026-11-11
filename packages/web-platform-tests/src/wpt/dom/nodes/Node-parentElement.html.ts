import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('When the parent is null, parentElement should be null', ({ document }) => {
		expect(document.parentElement).toBe(null);
	});
	context.test(
		'When the parent is a document, parentElement should be null (doctype)',
		({ document }) => {
			expect(document.doctype!.parentElement).toBe(null);
		},
	);
	context.test(
		'When the parent is a document, parentElement should be null (element)',
		({ document }) => {
			expect(document.documentElement.parentElement).toBe(null);
		},
	);
	context.test(
		'When the parent is a document, parentElement should be null (comment)',
		({ document }) => {
			let comment = document.appendChild(document.createComment('foo'));
			expect(comment.parentElement).toBe(null);
		},
	);
	context.test(
		'parentElement should return null for children of DocumentFragments (element)',
		({ document }) => {
			let df = document.createDocumentFragment();
			expect(df.parentElement).toBe(null);
			let el = document.createElement('div');
			expect(el.parentElement).toBe(null);
			df.appendChild(el);
			expect(el.parentNode).toBe(df);
			expect(el.parentElement).toBe(null);
		},
	);
	context.test(
		'parentElement should return null for children of DocumentFragments (text)',
		({ document }) => {
			let df = document.createDocumentFragment();
			expect(df.parentElement).toBe(null);
			let text = document.createTextNode('bar');
			expect(text.parentElement).toBe(null);
			df.appendChild(text);
			expect(text.parentNode).toBe(df);
			expect(text.parentElement).toBe(null);
		},
	);
	context.test(
		'parentElement should work correctly with DocumentFragments (element)',
		({ document }) => {
			let df = document.createDocumentFragment();
			let parent = document.createElement('div');
			df.appendChild(parent);
			let el = document.createElement('div');
			expect(el.parentElement).toBe(null);
			parent.appendChild(el);
			expect(el.parentElement).toBe(parent);
		},
	);
	context.test(
		'parentElement should work correctly with DocumentFragments (text)',
		({ document }) => {
			let df = document.createDocumentFragment();
			let parent = document.createElement('div');
			df.appendChild(parent);
			let text = document.createTextNode('bar');
			expect(text.parentElement).toBe(null);
			parent.appendChild(text);
			expect(text.parentElement).toBe(parent);
		},
	);
	context.test(
		'parentElement should work correctly in disconnected subtrees (element)',
		({ document }) => {
			let parent = document.createElement('div');
			let el = document.createElement('div');
			expect(el.parentElement).toBe(null);
			parent.appendChild(el);
			expect(el.parentElement).toBe(parent);
		},
	);
	context.test(
		'parentElement should work correctly in disconnected subtrees (text)',
		({ document }) => {
			let parent = document.createElement('div');
			let text = document.createTextNode('bar');
			expect(text.parentElement).toBe(null);
			parent.appendChild(text);
			expect(text.parentElement).toBe(parent);
		},
	);
	context.test('parentElement should work correctly in a document (element)', ({ document }) => {
		let el = document.createElement('div');
		expect(el.parentElement).toBe(null);
		document.body.appendChild(el);
		expect(el.parentElement).toBe(document.body);
	});
	context.test('parentElement should work correctly in a document (text)', ({ document }) => {
		let text = document.createElement('div');
		expect(text.parentElement).toBe(null);
		document.body.appendChild(text);
		expect(text.parentElement).toBe(document.body);
	});
}
