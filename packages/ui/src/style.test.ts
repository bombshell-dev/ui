import { describe, expect, expectTypeOf, it } from 'vitest';
import { Document } from './dom.ts';
import type { ColorValue } from './style.ts';

describe('inline style declarations', () => {
	it('keeps a stable style object for each element', () => {
		const document = new Document(() => {});
		const first = document.createElement('div');
		const second = document.createElement('span');
		const style = first.style;

		expect(style).toBeDefined();
		expect(first.style).toBe(style);
		expect(second.style).not.toBe(style);

		style.color = 'green';

		expect(first.style).toBe(style);
		expect(second.style.color).toBe('');
	});

	it('reads undeclared properties as empty strings, including element defaults', () => {
		const document = new Document(() => {});
		const { documentElement } = document;

		expect(documentElement.style.display, `${documentElement.tagName}.style.display`).toBe('');
		expect(
			documentElement.style.flexDirection,
			`${documentElement.tagName}.style.flexDirection`,
		).toBe('');
		expect(documentElement.style.gap, `${documentElement.tagName}.style.gap`).toBe('');
		expect(documentElement.style.paddingTop, `${documentElement.tagName}.style.paddingTop`).toBe(
			'',
		);
		expect(
			documentElement.style.paddingRight,
			`${documentElement.tagName}.style.paddingRight`,
		).toBe('');
		expect(
			documentElement.style.paddingBottom,
			`${documentElement.tagName}.style.paddingBottom`,
		).toBe('');
		expect(documentElement.style.paddingLeft, `${documentElement.tagName}.style.paddingLeft`).toBe(
			'',
		);
		expect(documentElement.style.borderStyle, `${documentElement.tagName}.style.borderStyle`).toBe(
			'',
		);
		expect(
			documentElement.style.borderTopWidth,
			`${documentElement.tagName}.style.borderTopWidth`,
		).toBe('');
		expect(
			documentElement.style.borderRightWidth,
			`${documentElement.tagName}.style.borderRightWidth`,
		).toBe('');
		expect(
			documentElement.style.borderBottomWidth,
			`${documentElement.tagName}.style.borderBottomWidth`,
		).toBe('');
		expect(
			documentElement.style.borderLeftWidth,
			`${documentElement.tagName}.style.borderLeftWidth`,
		).toBe('');
		expect(documentElement.style.borderColor, `${documentElement.tagName}.style.borderColor`).toBe(
			'',
		);
		expect(documentElement.style.color, `${documentElement.tagName}.style.color`).toBe('');

		const div = document.createElement('div');

		expect(div.style.display, `${div.tagName}.style.display`).toBe('');
		expect(div.style.flexDirection, `${div.tagName}.style.flexDirection`).toBe('');
		expect(div.style.gap, `${div.tagName}.style.gap`).toBe('');
		expect(div.style.paddingTop, `${div.tagName}.style.paddingTop`).toBe('');
		expect(div.style.paddingRight, `${div.tagName}.style.paddingRight`).toBe('');
		expect(div.style.paddingBottom, `${div.tagName}.style.paddingBottom`).toBe('');
		expect(div.style.paddingLeft, `${div.tagName}.style.paddingLeft`).toBe('');
		expect(div.style.borderStyle, `${div.tagName}.style.borderStyle`).toBe('');
		expect(div.style.borderTopWidth, `${div.tagName}.style.borderTopWidth`).toBe('');
		expect(div.style.borderRightWidth, `${div.tagName}.style.borderRightWidth`).toBe('');
		expect(div.style.borderBottomWidth, `${div.tagName}.style.borderBottomWidth`).toBe('');
		expect(div.style.borderLeftWidth, `${div.tagName}.style.borderLeftWidth`).toBe('');
		expect(div.style.borderColor, `${div.tagName}.style.borderColor`).toBe('');
		expect(div.style.color, `${div.tagName}.style.color`).toBe('');

		const span = document.createElement('span');

		expect(span.style.display, `${span.tagName}.style.display`).toBe('');
		expect(span.style.flexDirection, `${span.tagName}.style.flexDirection`).toBe('');
		expect(span.style.gap, `${span.tagName}.style.gap`).toBe('');
		expect(span.style.paddingTop, `${span.tagName}.style.paddingTop`).toBe('');
		expect(span.style.paddingRight, `${span.tagName}.style.paddingRight`).toBe('');
		expect(span.style.paddingBottom, `${span.tagName}.style.paddingBottom`).toBe('');
		expect(span.style.paddingLeft, `${span.tagName}.style.paddingLeft`).toBe('');
		expect(span.style.borderStyle, `${span.tagName}.style.borderStyle`).toBe('');
		expect(span.style.borderTopWidth, `${span.tagName}.style.borderTopWidth`).toBe('');
		expect(span.style.borderRightWidth, `${span.tagName}.style.borderRightWidth`).toBe('');
		expect(span.style.borderBottomWidth, `${span.tagName}.style.borderBottomWidth`).toBe('');
		expect(span.style.borderLeftWidth, `${span.tagName}.style.borderLeftWidth`).toBe('');
		expect(span.style.borderColor, `${span.tagName}.style.borderColor`).toBe('');
		expect(span.style.color, `${span.tagName}.style.color`).toBe('');
	});

	it('accepts direct display and flexDirection assignments', () => {
		const style = new Document(() => {}).createElement('div').style;

		style.display = 'inline';
		style.flexDirection = 'column';
		expect(style.display).toBe('inline');
		expect(style.flexDirection).toBe('column');

		style.display = 'flex';
		style.flexDirection = 'row';
		expect(style.display).toBe('flex');
		expect(style.flexDirection).toBe('row');
	});

	it('ignores unsupported display and flexDirection values', () => {
		const style = new Document(() => {}).createElement('div').style;
		style.display = 'inline';
		style.flexDirection = 'column';

		Reflect.set(style, 'display', 'grid');
		Reflect.set(style, 'flexDirection', 'row-reverse');

		expect(style.display).toBe('inline');
		expect(style.flexDirection).toBe('column');
	});

	it('accepts nonnegative whole-cell px lengths for gap and each padding side', () => {
		const style = new Document(() => {}).createElement('div').style;
		style.gap = '0px';
		style.paddingTop = '1px';
		style.paddingRight = '2px';
		style.paddingBottom = '3px';
		style.paddingLeft = '4px';

		expect(style.gap).toBe('0px');
		expect(style.paddingTop).toBe('1px');
		expect(style.paddingRight).toBe('2px');
		expect(style.paddingBottom).toBe('3px');
		expect(style.paddingLeft).toBe('4px');
	});

	it('types gap and padding as px strings or empty declarations', () => {
		const style = new Document(() => {}).createElement('div').style;

		expectTypeOf(style.gap).toEqualTypeOf<`${number}px` | ''>();
		expectTypeOf(style.paddingTop).toEqualTypeOf<`${number}px` | ''>();
		expectTypeOf(style.paddingRight).toEqualTypeOf<`${number}px` | ''>();
		expectTypeOf(style.paddingBottom).toEqualTypeOf<`${number}px` | ''>();
		expectTypeOf(style.paddingLeft).toEqualTypeOf<`${number}px` | ''>();
	});

	it('preserves previous lengths after invalid assignments', () => {
		const style = new Document(() => {}).createElement('div').style;

		for (const property of [
			'gap',
			'paddingTop',
			'paddingRight',
			'paddingBottom',
			'paddingLeft',
		] as const) {
			style[property] = '2px';

			for (const value of ['-1px', '1.5px', '1ch', '2', 'auto', 'NaNpx', 2]) {
				Reflect.set(style, property, value);
				expect(style[property], `${property} after ${String(value)}`).toBe('2px');
			}
		}
	});

	it('accepts zero or one cell for each border width and preserves other sides', () => {
		const style = new Document(() => {}).createElement('div').style;
		style.borderTopWidth = '0px';
		style.borderRightWidth = '1px';
		style.borderBottomWidth = '0px';
		style.borderLeftWidth = '1px';

		expect(style.borderTopWidth).toBe('0px');
		expect(style.borderRightWidth).toBe('1px');
		expect(style.borderBottomWidth).toBe('0px');
		expect(style.borderLeftWidth).toBe('1px');
	});

	it('preserves previous border widths after unsupported assignments', () => {
		const style = new Document(() => {}).createElement('div').style;

		for (const property of [
			'borderTopWidth',
			'borderRightWidth',
			'borderBottomWidth',
			'borderLeftWidth',
		] as const) {
			style[property] = '1px';

			for (const value of ['2px', '-1px', '0.5px', '1ch', 'thick', 1]) {
				Reflect.set(style, property, value);
				expect(style[property], `${property} after ${String(value)}`).toBe('1px');
			}
		}
	});

	it('supports solid and none without erasing border width or color declarations', () => {
		const style = new Document(() => {}).createElement('div').style;
		style.borderTopWidth = '1px';
		style.borderColor = 'blue';
		const color = style.borderColor;
		style.borderStyle = 'solid';
		expect(style.borderStyle).toBe('solid');

		style.borderStyle = 'none';
		expect(style.borderStyle).toBe('none');
		expect(style.borderTopWidth).toBe('1px');
		expect(style.borderColor).toBe(color);

		Reflect.set(style, 'borderStyle', 'dashed');
		expect(style.borderStyle).toBe('none');
	});

	it.each(['rgb(0 205 0)', 'rgba(0, 205, 0, 0.5)', '#00cd00', 'green', 'hsl(120 100% 40%)'])(
		'accepts %s for text and border colors',
		(value) => {
			const style = new Document(() => {}).createElement('span').style;
			const color = value as ColorValue;
			style.color = color;
			style.borderColor = color;

			// Valid declarations may serialize into a normalized CSS color string.
			expect(style.color).toEqual(expect.any(String));
			expect(style.color).not.toBe('');
			expect(style.borderColor).toEqual(expect.any(String));
			expect(style.borderColor).not.toBe('');
		},
	);

	it('accepts currentColor as an explicit border color declaration', () => {
		const style = new Document(() => {}).createElement('div').style;
		style.borderColor = 'currentColor';

		expect(style.borderColor.toLowerCase()).toBe('currentcolor');
		expect(style.color).toBe('');
	});

	it('preserves previous color declarations after invalid assignments', () => {
		const style = new Document(() => {}).createElement('span').style;
		style.color = 'green';
		style.borderColor = 'blue';

		for (const property of ['color', 'borderColor'] as const) {
			const previous = style[property];

			for (const value of ['not-a-color', '#xyz', 'rgb(0 205)', 42]) {
				Reflect.set(style, property, value);
				expect(style[property], `${property} after ${String(value)}`).toBe(previous);
			}
		}
	});

	it('removes inline declarations when assigned an empty string', () => {
		const style = new Document(() => {}).createElement('div').style;
		style.display = 'inline';
		style.flexDirection = 'column';
		style.gap = '1px';
		style.paddingLeft = '2px';
		style.borderStyle = 'solid';
		style.borderLeftWidth = '1px';
		style.borderColor = 'blue';
		style.color = 'green';

		for (const property of [
			'display',
			'flexDirection',
			'gap',
			'paddingLeft',
			'borderStyle',
			'borderLeftWidth',
			'borderColor',
			'color',
		] as const) {
			style[property] = '';
			expect(style[property], property).toBe('');
		}
	});
});
