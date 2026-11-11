import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'indexed access returns property names in insertion order',
		({ document }) => {
			const div = document.getElementById('div')!;

			div.style.setProperty('color', 'red');
			div.style.setProperty('background-color', 'blue');

			expect(div.style[0]).toBe('color');
			expect(div.style[1]).toBe('background-color');
			expect(div.style[2]).toBe(undefined);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>CSSStyleDeclaration indexed property access</title>\n\n\n\n\n<div id="div"></div>\n\n',
			},
		},
	);
	context.test(
		'indexed access works after setting cssText',
		({ document }) => {
			const div = document.getElementById('div')!;

			div.style.cssText = 'margin-top: 5px; padding: 10px';

			expect(div.style[0]).toBe('margin-top');
			expect(div.style[1]).toBe('padding-top');
			expect(div.style[2]).toBe('padding-right');
			expect(div.style[3]).toBe('padding-bottom');
			expect(div.style[4]).toBe('padding-left');
			expect(div.style[div.style.length]).toBe(undefined);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>CSSStyleDeclaration indexed property access</title>\n\n\n\n\n<div id="div"></div>\n\n',
			},
		},
	);
	context.test(
		'indexed access updates after removeProperty',
		({ document }) => {
			const div = document.getElementById('div')!;

			div.style.cssText = 'color: red; background-color: blue';
			div.style.removeProperty('color');

			expect(div.style.length).toBe(1);
			expect(div.style[0]).toBe('background-color');
			expect(div.style[1]).toBe(undefined);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>CSSStyleDeclaration indexed property access</title>\n\n\n\n\n<div id="div"></div>\n\n',
			},
		},
	);
	context.test(
		'indexed access on empty style returns undefined',
		({ document }) => {
			const div = document.getElementById('div')!;

			div.style.cssText = '';

			expect(div.style.length).toBe(0);
			expect(div.style[0]).toBe(undefined);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>CSSStyleDeclaration indexed property access</title>\n\n\n\n\n<div id="div"></div>\n\n',
			},
		},
	);
	context.test(
		'in operator works for indexed properties',
		({ document }) => {
			const div = document.getElementById('div')!;

			div.style.cssText = 'color: red';

			expect('1' in div.style).toBe(false);
			expect('0' in div.style).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>CSSStyleDeclaration indexed property access</title>\n\n\n\n\n<div id="div"></div>\n\n',
			},
		},
	);
	context.test(
		'indexed properties are enumerable',
		({ document }) => {
			const div = document.getElementById('div')!;

			div.style.cssText = 'color: red; background-color: blue';

			const keys = [];
			for (const key in div.style) {
				if (key === '0' || key === '1') {
					keys.push(key);
				}
			}
			expect(keys.length).toBe(2);
			expect(keys[0]).toBe('0');
			expect(keys[1]).toBe('1');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>CSSStyleDeclaration indexed property access</title>\n\n\n\n\n<div id="div"></div>\n\n',
			},
		},
	);
}
