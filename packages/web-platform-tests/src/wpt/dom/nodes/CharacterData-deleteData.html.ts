import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [type, create] of [
		['Text', 'createTextNode'],
		['Comment', 'createComment'],
	] as const) {
		context.test(type + '.deleteData() out of bounds', ({ document, DOMException }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(function () {
				node.deleteData(5, 10);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.deleteData(5, 0);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.deleteData(-1, 10);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.deleteData(-1, 0);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
		});
		context.test(type + '.deleteData() at the start', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.deleteData(0, 2);
			expect(node.data).toBe('st');
		});
		context.test(type + '.deleteData() at the end', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.deleteData(2, 10);
			expect(node.data).toBe('te');
		});
		context.test(type + '.deleteData() in the middle', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.deleteData(1, 1);
			expect(node.data).toBe('tst');
		});
		context.test(type + '.deleteData() with zero count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.deleteData(2, 0);
			expect(node.data).toBe('test');

			node.deleteData(0, 0);
			expect(node.data).toBe('test');
		});
		context.test(type + '.deleteData() with small negative count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.deleteData(2, -1);
			expect(node.data).toBe('te');
		});
		context.test(type + '.deleteData() with large negative count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.deleteData(1, -0x100000000 + 2);
			expect(node.data).toBe('tt');
		});
		context.test(type + '.deleteData() with non-ascii data', ({ document }) => {
			let node = document[create]('test');
			node.data = 'This is the character data test, append more 資料，更多測試資料';

			node.deleteData(40, 5);
			expect(node.data).toBe('This is the character data test, append 資料，更多測試資料');
			node.deleteData(45, 2);
			expect(node.data).toBe('This is the character data test, append 資料，更多資料');
		});
		context.test(type + '.deleteData() with non-BMP data', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.data = '🌠 test 🌠 TEST';

			node.deleteData(5, 8); // Counting UTF-16 code units
			expect(node.data).toBe('🌠 teST');
		});
	}
}
