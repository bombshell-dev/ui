import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [type, create] of [
		['Text', 'createTextNode'],
		['Comment', 'createComment'],
	] as const) {
		context.test(type + '.replaceData() with invalid offset', ({ document, DOMException }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(function () {
				node.replaceData(5, 1, 'x');
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.replaceData(5, 0, '');
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.replaceData(-1, 1, 'x');
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.replaceData(-1, 0, '');
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(node.data).toBe('test');
		});
		context.test(type + '.replaceData() with clamped count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(2, 10, 'yo');
			expect(node.data).toBe('teyo');
		});
		context.test(type + '.replaceData() with negative clamped count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(2, -1, 'yo');
			expect(node.data).toBe('teyo');
		});
		context.test(type + '.replaceData() before the start', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(0, 0, 'yo');
			expect(node.data).toBe('yotest');
		});
		context.test(type + '.replaceData() at the start (shorter)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(0, 2, 'y');
			expect(node.data).toBe('yst');
		});
		context.test(type + '.replaceData() at the start (equal length)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(0, 2, 'yo');
			expect(node.data).toBe('yost');
		});
		context.test(type + '.replaceData() at the start (longer)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(0, 2, 'yoa');
			expect(node.data).toBe('yoast');
		});
		context.test(type + '.replaceData() in the middle (shorter)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(1, 2, 'o');
			expect(node.data).toBe('tot');
		});
		context.test(type + '.replaceData() in the middle (equal length)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(1, 2, 'yo');
			expect(node.data).toBe('tyot');
		});
		context.test(type + '.replaceData() in the middle (longer)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(1, 1, 'waddup');
			expect(node.data).toBe('twaddupst');
			node.replaceData(1, 1, 'yup');
			expect(node.data).toBe('tyupaddupst');
		});
		context.test(type + '.replaceData() at the end (shorter)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(1, 20, 'yo');
			expect(node.data).toBe('tyo');
		});
		context.test(type + '.replaceData() at the end (same length)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(2, 20, 'yo');
			expect(node.data).toBe('teyo');
		});
		context.test(type + '.replaceData() at the end (longer)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(4, 20, 'yo');
			expect(node.data).toBe('testyo');
		});
		context.test(type + '.replaceData() the whole string', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(0, 4, 'quux');
			expect(node.data).toBe('quux');
		});
		context.test(type + '.replaceData() with the empty string', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.replaceData(0, 4, '');
			expect(node.data).toBe('');
		});
		context.test(type + '.replaceData() with non-ASCII data', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.data = 'This is the character data test, append 資料，更多資料';

			node.replaceData(33, 6, 'other');
			expect(node.data).toBe('This is the character data test, other 資料，更多資料');
			node.replaceData(44, 2, '文字');
			expect(node.data).toBe('This is the character data test, other 資料，更多文字');
		});
		context.test(type + '.replaceData() with non-BMP data', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.data = '🌠 test 🌠 TEST';

			node.replaceData(5, 8, '--'); // Counting UTF-16 code units
			expect(node.data).toBe('🌠 te--ST');
		});
	}
}
