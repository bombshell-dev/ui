import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function html({ document, connect }: DOMFixture, markup: string): Document {
		const container = document.createElement('div');
		container.innerHTML = markup;
		for (const child of Array.from(container.children)) connect(child);
		return document;
	}

	const { expect } = context.runner;

	for (const { id, selector, nested, title } of [
		{
			id: 'template1',
			selector: 'div',
			nested: false,
			title: 'querySelector works on template contents fragments with HTML elements (sanity check)',
		},
		{
			id: 'template2',
			selector: 'svg',
			nested: false,
			title: 'querySelector works on template contents fragments with SVG elements',
		},
		{
			id: 'template3',
			selector: 'svg',
			nested: true,
			title: 'querySelector works on template contents fragments with nested SVG elements',
		},
	]) {
		context.test(`WPT svg-template-querySelector.html: ${title}`, (fixture) => {
			const document = html(
				fixture,
				'<template id="template1"><div></div></template>\n<template id="template2"><svg></svg></template>\n<template id="template3"><div><svg></svg></div></template>',
			);
			const fragment = (document.getElementById(id) as HTMLTemplateElement).content;
			const scope = nested ? (fragment.firstChild as Element) : fragment;
			expect(scope.querySelector(selector)).not.toBeNull();
		});
	}
}
