import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;

		context.test('Comment' + '.data initial value', ({ document }) => {
			let node = document.createComment('test');
			expect(node.data).toBe('test');
			expect(node.length).toBe(4);
		});
		context.test('Comment' + '.data = null', ({ document }) => {
			let node = document.createComment('test');
			expect(node.data).toBe('test');

			node.data = null as unknown as string;
			expect(node.data).toBe('');
			expect(node.length).toBe(0);
		});
		context.test('Comment' + '.data = undefined', ({ document }) => {
			let node = document.createComment('test');
			expect(node.data).toBe('test');

			node.data = undefined as unknown as string;
			expect(node.data).toBe('undefined');
			expect(node.length).toBe(9);
		});
		context.test('Comment' + '.data = 0', ({ document }) => {
			let node = document.createComment('test');
			expect(node.data).toBe('test');

			node.data = 0 as unknown as string;
			expect(node.data).toBe('0');
			expect(node.length).toBe(1);
		});
		context.test('Comment' + ".data = ''", ({ document }) => {
			let node = document.createComment('test');
			expect(node.data).toBe('test');

			node.data = '';
			expect(node.data).toBe('');
			expect(node.length).toBe(0);
		});
		context.test('Comment' + ".data = '--'", ({ document }) => {
			let node = document.createComment('test');
			expect(node.data).toBe('test');

			node.data = '--';
			expect(node.data).toBe('--');
			expect(node.length).toBe(2);
		});
		context.test('Comment' + ".data = '資料'", ({ document }) => {
			let node = document.createComment('test');
			expect(node.data).toBe('test');

			node.data = '資料';
			expect(node.data).toBe('資料');
			expect(node.length).toBe(2);
		});
		context.test('Comment' + ".data = '🌠 test 🌠 TEST'", ({ document }) => {
			let node = document.createComment('test');
			expect(node.data).toBe('test');

			node.data = '🌠 test 🌠 TEST';
			expect(node.data).toBe('🌠 test 🌠 TEST');
			expect(node.length).toBe(15); // Counting UTF-16 code units
		});
	}

	{
		const { expect } = context.runner;

		context.test('Text' + '.data initial value', ({ document }) => {
			let node = document.createTextNode('test');
			expect(node.data).toBe('test');
			expect(node.length).toBe(4);
		});
		context.test('Text' + '.data = null', ({ document }) => {
			let node = document.createTextNode('test');
			expect(node.data).toBe('test');

			node.data = null as unknown as string;
			expect(node.data).toBe('');
			expect(node.length).toBe(0);
		});
		context.test('Text' + '.data = undefined', ({ document }) => {
			let node = document.createTextNode('test');
			expect(node.data).toBe('test');

			node.data = undefined as unknown as string;
			expect(node.data).toBe('undefined');
			expect(node.length).toBe(9);
		});
		context.test('Text' + '.data = 0', ({ document }) => {
			let node = document.createTextNode('test');
			expect(node.data).toBe('test');

			node.data = 0 as unknown as string;
			expect(node.data).toBe('0');
			expect(node.length).toBe(1);
		});
		context.test('Text' + ".data = ''", ({ document }) => {
			let node = document.createTextNode('test');
			expect(node.data).toBe('test');

			node.data = '';
			expect(node.data).toBe('');
			expect(node.length).toBe(0);
		});
		context.test('Text' + ".data = '--'", ({ document }) => {
			let node = document.createTextNode('test');
			expect(node.data).toBe('test');

			node.data = '--';
			expect(node.data).toBe('--');
			expect(node.length).toBe(2);
		});
		context.test('Text' + ".data = '資料'", ({ document }) => {
			let node = document.createTextNode('test');
			expect(node.data).toBe('test');

			node.data = '資料';
			expect(node.data).toBe('資料');
			expect(node.length).toBe(2);
		});
		context.test('Text' + ".data = '🌠 test 🌠 TEST'", ({ document }) => {
			let node = document.createTextNode('test');
			expect(node.data).toBe('test');

			node.data = '🌠 test 🌠 TEST';
			expect(node.data).toBe('🌠 test 🌠 TEST');
			expect(node.length).toBe(15); // Counting UTF-16 code units
		});
	}
}
