import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('innerHTML and string conversion: null.', ({ document }) => {
		var p = document.createElement('p');
		p.innerHTML = null as unknown as string;
		expect(p.innerHTML).toBe('');
		expect(p.textContent).toBe('');
	});
	context.test('innerHTML and string conversion: undefined.', ({ document }) => {
		var p = document.createElement('p');
		p.innerHTML = undefined as unknown as string;
		expect(p.innerHTML).toBe('undefined');
		expect(p.textContent).toBe('undefined');
	});
	context.test('innerHTML and string conversion: number.', ({ document }) => {
		var p = document.createElement('p');
		p.innerHTML = 42 as unknown as string;
		expect(p.innerHTML).toBe('42');
		expect(p.textContent).toBe('42');
	});
	context.test('innerHTML and string conversion: toString.', ({ document }) => {
		var p = document.createElement('p');
		p.innerHTML = {
			toString: function () {
				return 'pass';
			},
			valueOf: function () {
				return 'fail';
			},
		} as unknown as string;
		expect(p.innerHTML).toBe('pass');
		expect(p.textContent).toBe('pass');
	});
	context.test('innerHTML and string conversion: valueOf.', ({ document }) => {
		var p = document.createElement('p');
		p.innerHTML = {
			toString: undefined,
			valueOf: function () {
				return 'pass';
			},
		} as unknown as string;
		expect(p.innerHTML).toBe('pass');
		expect(p.textContent).toBe('pass');
	});
}
