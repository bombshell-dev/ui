import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [type, create] of [
		['Text', 'createTextNode'],
		['Comment', 'createComment'],
	] as const) {
		context.test(type + '.insertData() out of bounds', ({ document, DOMException }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(function () {
				node.insertData(5, 'x');
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.insertData(5, '');
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
		});
		context.test(type + '.insertData() negative out of bounds', ({ document, DOMException }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(function () {
				node.insertData(-1, 'x');
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.insertData(-0x100000000 + 5, 'x');
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
		});
		context.test(type + '.insertData() negative in bounds', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.insertData(-0x100000000 + 2, 'X');
			expect(node.data).toBe('teXst');
		});
		context.test(type + ".insertData('')", ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.insertData(0, '');
			expect(node.data).toBe('test');
		});
		context.test(type + '.insertData() at the start', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.insertData(0, 'X');
			expect(node.data).toBe('Xtest');
		});
		context.test(type + '.insertData() in the middle', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.insertData(2, 'X');
			expect(node.data).toBe('teXst');
		});
		context.test(type + '.insertData() at the end', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.insertData(4, 'ing');
			expect(node.data).toBe('testing');
		});
		context.test(type + '.insertData() with non-ascii data', ({ document }) => {
			let node = document[create]('test');
			node.data = 'This is the character data, append more 資料，測試資料';

			node.insertData(26, ' test');
			expect(node.data).toBe('This is the character data test, append more 資料，測試資料');
			node.insertData(48, '更多');
			expect(node.data).toBe('This is the character data test, append more 資料，更多測試資料');
		});
		context.test(type + '.insertData() with non-BMP data', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.data = '🌠 test 🌠 TEST';

			node.insertData(5, '--'); // Counting UTF-16 code units
			expect(node.data).toBe('🌠 te--st 🌠 TEST');
		});
	}
}
