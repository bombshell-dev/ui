import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function html({ document, connect }: DOMFixture, markup: string): Document {
		const container = document.createElement('div');
		container.innerHTML = markup;
		for (const child of Array.from(container.children)) connect(child);
		return document;
	}

	const { expect } = context.runner;

	for (const method of ['querySelector', 'querySelectorAll'] as const) {
		context.test(`WPT ParentNode-querySelector-case-insensitive.html: ${method}`, (fixture) => {
			const document = html(fixture, '<input name="User" id="testInput">');
			const input = document.getElementById('testInput');
			if (method === 'querySelector')
				expect(document.querySelector('input[name*=user i]')).toBe(input);
			else expect(Array.from(document.querySelectorAll('input[name*=user i]'))).toEqual([input]);
		});
	}
}
