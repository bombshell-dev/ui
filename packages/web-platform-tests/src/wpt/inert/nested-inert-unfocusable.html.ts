import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Input element in nested inerts is not focusable',
		({ document }) => {
			const outer = document.getElementById('outer')!,
				inner = document.getElementById('inner')!,
				inp = document.getElementById('inp')!;

			inp.focus();
			expect(document.activeElement).not.toBe(inp);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<title>Nested inert, focusability and dynamic changes</title>\n\n\n\n<div id="outer" inert>\n  <div id="inner" inert>\n    <input id="inp" type="text">\n  </div>\n</div>\n\n',
			},
		},
	);
	context.test(
		'Input element still not focusable after outer inert removed',
		({ document }) => {
			const outer = document.getElementById('outer')!,
				inner = document.getElementById('inner')!,
				inp = document.getElementById('inp')!;

			outer.inert = false;
			inp.focus();
			expect(document.activeElement).not.toBe(inp);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<title>Nested inert, focusability and dynamic changes</title>\n\n\n\n<div id="outer" inert>\n  <div id="inner" inert>\n    <input id="inp" type="text">\n  </div>\n</div>\n\n',
			},
		},
	);
	context.test(
		'Input element focusable with both inerts removed',
		({ document }) => {
			const outer = document.getElementById('outer')!,
				inner = document.getElementById('inner')!,
				inp = document.getElementById('inp')!;
			outer.inert = false;

			inner.inert = false;
			inp.focus();
			expect(document.activeElement).toBe(inp);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<title>Nested inert, focusability and dynamic changes</title>\n\n\n\n<div id="outer" inert>\n  <div id="inner" inert>\n    <input id="inp" type="text">\n  </div>\n</div>\n\n',
			},
		},
	);
}
