import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [type, create] of [
		['Text', 'createTextNode'],
		['Comment', 'createComment'],
	] as const) {
		context.test(type + ".appendData('bar')", ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.appendData('bar');
			expect(node.data).toBe('testbar');
		});
		context.test(type + ".appendData('')", ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.appendData('');
			expect(node.data).toBe('test');
		});
		context.test(type + '.appendData(non-ASCII)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');
			node.appendData(', append more 資料，測試資料');
			expect(node.data).toBe('test, append more 資料，測試資料');
			expect(node.length).toBe(25);
		});
		context.test(type + '.appendData(null)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.appendData(null as unknown as string);
			expect(node.data).toBe('testnull');
		});
		context.test(type + '.appendData(undefined)', ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			node.appendData(undefined as unknown as string);
			expect(node.data).toBe('testundefined');
		});
		context.test(type + ".appendData('', 'bar')", ({ document }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');
			(node.appendData as (...args: string[]) => void)('', 'bar');
			expect(node.data).toBe('test');
		});
		context.test(type + '.appendData()', ({ document, TypeError }) => {
			let node = document[create]('test');
			expect(node.data).toBe('test');

			expect(function () {
				(node.appendData as (...args: unknown[]) => string)();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(node.data).toBe('test');
		});
	}
}
