import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('<select> needs to be updated when <optgroup> is removed', ({ document }) => {
		const select = document.createElement('select');
		select.innerHTML = '<optgroup><option>1</optgroup><optgroup><option>2';
		expect(select.value).toBe('1');
		select.querySelector('optgroup')!.remove();
		expect(select.value).toBe('2');
	});
}
