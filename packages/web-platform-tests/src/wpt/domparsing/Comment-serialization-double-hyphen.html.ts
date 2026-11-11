import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test("Serializing a comment containing '--' via innerHTML", ({ document }) => {
		const p = document.createElement('p');
		const comment = document.createComment('abc--def');
		p.appendChild(comment);
		expect(p.innerHTML).toBe('<!--abc--def-->');
	});
	context.test("Serializing a comment containing '-->' via innerHTML", ({ document }) => {
		const p = document.createElement('p');
		const comment = document.createComment('abc-->def<!--ghj');
		p.appendChild(comment);
		expect(p.innerHTML).toBe('<!--abc-->def<!--ghj-->');
	});
	context.test("Serializing a comment containing only '--' via innerHTML", ({ document }) => {
		const p = document.createElement('p');
		const comment = document.createComment('--');
		p.appendChild(comment);
		expect(p.innerHTML).toBe('<!------>');
	});
}
