import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const nodeName of ['Element', 'DocumentFragment'] as const) {
		context.test(
			nodeName + '.prepend() without any argument, on a parent having no child.',
			({ document }) => {
				const parent = (
					nodeName === 'Element' ? document.createElement('div') : document.createDocumentFragment()
				).cloneNode() as Element | DocumentFragment;
				parent.prepend();
				expect(parent.childNodes).toHaveLength(0);
			},
		);
		context.test(
			nodeName + '.prepend() with null as an argument, on a parent having no child.',
			({ document }) => {
				const parent = (
					nodeName === 'Element' ? document.createElement('div') : document.createDocumentFragment()
				).cloneNode() as Element | DocumentFragment;
				parent.prepend(null as unknown as string);
				expect(parent.childNodes[0]!.textContent).toBe('null');
			},
		);
		context.test(
			nodeName + '.prepend() with undefined as an argument, on a parent having no child.',
			({ document }) => {
				const parent = (
					nodeName === 'Element' ? document.createElement('div') : document.createDocumentFragment()
				).cloneNode() as Element | DocumentFragment;
				parent.prepend(undefined as unknown as string);
				expect(parent.childNodes[0]!.textContent).toBe('undefined');
			},
		);
		context.test(
			nodeName + '.prepend() with only text as an argument, on a parent having no child.',
			({ document }) => {
				const parent = (
					nodeName === 'Element' ? document.createElement('div') : document.createDocumentFragment()
				).cloneNode() as Element | DocumentFragment;
				parent.prepend('text');
				expect(parent.childNodes[0]!.textContent).toBe('text');
			},
		);
		context.test(
			nodeName + '.prepend() with only one element as an argument, on a parent having no child.',
			({ document }) => {
				const parent = (
					nodeName === 'Element' ? document.createElement('div') : document.createDocumentFragment()
				).cloneNode() as Element | DocumentFragment;
				const x = document.createElement('x');
				parent.prepend(x);
				expect(parent.childNodes).toHaveLength(1);
				expect(parent.childNodes[0]).toBe(x);
			},
		);
		context.test(
			nodeName + '.prepend() with null as an argument, on a parent having a child.',
			({ document }) => {
				const parent = (
					nodeName === 'Element' ? document.createElement('div') : document.createDocumentFragment()
				).cloneNode() as Element | DocumentFragment;
				const child = document.createElement('test');
				parent.appendChild(child);
				parent.prepend(null as unknown as string);
				expect(parent.childNodes[0]!.textContent).toBe('null');
				expect(parent.childNodes[1]).toBe(child);
			},
		);
		context.test(
			nodeName + '.prepend() with one element and text as argument, on a parent having a child.',
			({ document }) => {
				const parent = (
					nodeName === 'Element' ? document.createElement('div') : document.createDocumentFragment()
				).cloneNode() as Element | DocumentFragment;
				const x = document.createElement('x');
				const child = document.createElement('test');
				parent.appendChild(child);
				parent.prepend(x, 'text');
				expect(parent.childNodes[0]).toBe(x);
				expect(parent.childNodes[1]!.textContent).toBe('text');
				expect(parent.childNodes[2]).toBe(child);
			},
		);
	}
}
