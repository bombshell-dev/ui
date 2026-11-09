import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	const spaces = ['\u0020', '\u0009', '\u000A', '\u000C', '\u000D'];
	for (const space of spaces) {
		context.test(
			'option.text should strip leading space characters (' + JSON.stringify(space) + ')',
			({ document }) => {
				let option = document.createElement('option');
				option.textContent = space + 'text';
				expect(option.text).toBe('text');
			},
		);
		context.test(
			'option.text should strip trailing space characters (' + JSON.stringify(space) + ')',
			({ document }) => {
				let option = document.createElement('option');
				option.textContent = 'text' + space;
				expect(option.text).toBe('text');
			},
		);
		context.test(
			'option.text should strip leading and trailing space characters (' +
				JSON.stringify(space) +
				')',
			({ document }) => {
				let option = document.createElement('option');
				option.textContent = space + 'text' + space;
				expect(option.text).toBe('text');
			},
		);
		context.test(
			'option.text should replace single internal space characters (' + JSON.stringify(space) + ')',
			({ document }) => {
				let option = document.createElement('option');
				option.textContent = 'before' + space + 'after';
				expect(option.text).toBe('before after');
			},
		);
	}
	for (const space1 of spaces) {
		for (const space2 of spaces) {
			context.test(
				'option.text should replace multiple internal space characters (' +
					JSON.stringify(space1) +
					', ' +
					JSON.stringify(space2) +
					')',
				({ document }) => {
					let option = document.createElement('option');
					option.textContent = 'before' + space1 + space2 + 'after';
					expect(option.text).toBe('before after');
				},
			);
		}
	}
	context.test('option.text should leave leading NBSP alone.', ({ document }) => {
		let option = document.createElement('option');
		option.textContent = '\u00a0text';
		expect(option.text).toBe('\u00a0text');
	});
	context.test('option.text should leave trailing NBSP alone.', ({ document }) => {
		let option = document.createElement('option');
		option.textContent = 'text\u00a0';
		expect(option.text).toBe('text\u00a0');
	});
	context.test('option.text should leave a single internal NBSP alone.', ({ document }) => {
		let option = document.createElement('option');
		option.textContent = 'before\u00a0after';
		expect(option.text).toBe('before\u00a0after');
	});
	context.test('option.text should leave two internal NBSPs alone.', ({ document }) => {
		let option = document.createElement('option');
		option.textContent = 'before\u00a0\u00a0after';
		expect(option.text).toBe('before\u00a0\u00a0after');
	});
}
