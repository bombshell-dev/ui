import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [type, create] of [
		['Text', 'createTextNode'],
		['Comment', 'createComment'],
	] as const) {
		context.test(type + '.substringData() with too few arguments', ({ document, TypeError }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(function () {
				(node.substringData as (...args: unknown[]) => string)();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				(node.substringData as (...args: unknown[]) => string)(0);
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		});
		context.test(type + '.substringData() with too many arguments', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect((node.substringData as (...args: unknown[]) => string)(0, 1, 'test')).toBe('t');
		});
		context.test(type + '.substringData() with invalid offset', ({ document, DOMException }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(function () {
				node.substringData(5, 0);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.substringData(6, 0);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
			expect(function () {
				node.substringData(-1, 0);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
		});
		context.test(type + '.substringData() with in-bounds offset', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(node.substringData(0, 1)).toBe('t');
			expect(node.substringData(1, 1)).toBe('e');
			expect(node.substringData(2, 1)).toBe('s');
			expect(node.substringData(3, 1)).toBe('t');
			expect(node.substringData(4, 1)).toBe('');
		});
		context.test(type + '.substringData() with zero count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(node.substringData(0, 0)).toBe('');
			expect(node.substringData(1, 0)).toBe('');
			expect(node.substringData(2, 0)).toBe('');
			expect(node.substringData(3, 0)).toBe('');
			expect(node.substringData(4, 0)).toBe('');
		});
		context.test(type + '.substringData() with very large offset', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(node.substringData(0x100000000 + 0, 1)).toBe('t');
			expect(node.substringData(0x100000000 + 1, 1)).toBe('e');
			expect(node.substringData(0x100000000 + 2, 1)).toBe('s');
			expect(node.substringData(0x100000000 + 3, 1)).toBe('t');
			expect(node.substringData(0x100000000 + 4, 1)).toBe('');
		});
		context.test(type + '.substringData() with negative offset', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(node.substringData(-0x100000000 + 2, 1)).toBe('s');
		});
		context.test(type + '.substringData() with string offset', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(node.substringData('test' as unknown as number, 3)).toBe('tes');
		});
		context.test(type + '.substringData() with in-bounds count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(node.substringData(0, 1)).toBe('t');
			expect(node.substringData(0, 2)).toBe('te');
			expect(node.substringData(0, 3)).toBe('tes');
			expect(node.substringData(0, 4)).toBe('test');
		});
		context.test(type + '.substringData() with large count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(node.substringData(0, 5)).toBe('test');
			expect(node.substringData(2, 20)).toBe('st');
		});
		context.test(type + '.substringData() with very large count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(node.substringData(2, 0x100000000 + 1)).toBe('s');
		});
		context.test(type + '.substringData() with negative count', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(node.substringData(0, -1)).toBe('test');
			expect(node.substringData(0, -0x100000000 + 2)).toBe('te');
		});
		context.test(type + '.substringData() with non-ASCII data', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.data = 'This is the character data test, other 資料，更多文字';

			expect(node.substringData(12, 4)).toBe('char');
			expect(node.substringData(39, 2)).toBe('資料');
		});
		context.test(type + '.substringData() with non-BMP data', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.data = '🌠 test 🌠 TEST';

			expect(node.substringData(5, 8)).toBe('st 🌠 TE'); // Counting UTF-16 code units
		});
	}
}
