import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const content = `<!doctype html>
<meta charset=utf-8>
<title>Absence of a named getter on HTMLSelectElement</title>


<div id=log></div>
<select id=select>
  <option id=op1>A</option>
  <option name=op2>B</option>
  <option id=op3 name=op4>C</option>
  <option id=>D</option>
  <option name=>D</option>
</select>

`;

		context.test(
			'Option with id',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				let select = document.getElementById('select') as HTMLSelectElement &
					Record<string, unknown>;
				expect(select.op1).toBe(undefined);
				expect('op1' in select).toBe(false);
				expect(select.namedItem('op1')).toBe(select.children[0]);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Option with name',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				let select = document.getElementById('select') as HTMLSelectElement &
					Record<string, unknown>;
				expect(select.op2).toBe(undefined);
				expect('op2' in select).toBe(false);
				expect(select.namedItem('op2')).toBe(select.children[1]);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Option with name and id',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				let select = document.getElementById('select') as HTMLSelectElement &
					Record<string, unknown>;
				expect(select.op3).toBe(undefined);
				expect('op3' in select).toBe(false);
				expect(select.namedItem('op3')).toBe(select.children[2]);

				expect(select.op4).toBe(undefined);
				expect('op4' in select).toBe(false);
				expect(select.namedItem('op4')).toBe(select.children[2]);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Empty string name',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				let select = document.getElementById('select') as HTMLSelectElement &
					Record<string, unknown>;
				expect(select['']).toBe(undefined);
				expect('' in select).toBe(false);
				expect(select.namedItem('')).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
