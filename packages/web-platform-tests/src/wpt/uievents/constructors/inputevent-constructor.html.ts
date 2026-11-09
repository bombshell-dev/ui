import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('InputEvent constructor without InputEventInit.', ({ InputEvent }) => {
		let e = new InputEvent('type');
		expect(e.data, '.data').toBe(null);
		expect(e.isComposing, '.isComposing').toBe(false);
		expect(e.inputType, '.inputType').toBe('');
	});
	context.test('InputEvent construtor with InputEventInit where data is null', ({ InputEvent }) => {
		let e = new InputEvent('type', { data: null, isComposing: true });
		expect(e.data, '.data').toBe(null);
		expect(e.isComposing, '.isComposing').toBe(true);
	});
	context.test(
		'InputEvent construtor with InputEventInit where data is empty string',
		({ InputEvent }) => {
			expect(new InputEvent('type', { data: '' }).data, '.data').toBe('');
		},
	);
	context.test(
		'InputEvent construtor with InputEventInit where data is non empty string',
		({ InputEvent }) => {
			expect(new InputEvent('type', { data: 'data' }).data, '.data').toBe('data');
		},
	);
	context.test('InputEvent constructor with an explicit inputType', ({ InputEvent }) => {
		const event = new InputEvent('type', { inputType: 'insertText' });
		expect(event.inputType, '.inputType').toBe('insertText');
	});
}
