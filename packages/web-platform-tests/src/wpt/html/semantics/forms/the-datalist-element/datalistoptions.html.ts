import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!doctype html><div id="log"></div>
<label>
  Number:
  <input list=numbers>
</label>
<datalist id=numbers>
  <label> Select number:
    <select id=num>
      <option label="zero" value="0">
      <option label="one" value="1">
      <option label="two">2
      <option label="three" disabled>3
      <option>
    </select>
  </label>
</datalist>
`;
	context.test(
		'options label/value',
		({ document }) => {
			let datalist = document.getElementById('numbers') as HTMLDataListElement,
				labels = [],
				values = [];
			expect(datalist.options.length).toBe(5);

			for (let i = 0, len = datalist.options.length; i < len; i++) {
				expect(datalist.options[i]).toBe(datalist.options.item(i));
				labels.push(datalist.options[i]!.label);
				values.push(datalist.options[i]!.value);
			}
			expect(labels).toHaveLength(5);
			expect(labels[0]).toBe('zero');
			expect(labels[1]).toBe('one');
			expect(labels[2]).toBe('two');
			expect(labels[3]).toBe('three');
			expect(labels[4]).toBe('');
			expect(values).toHaveLength(5);
			expect(values[0]).toBe('0');
			expect(values[1]).toBe('1');
			expect(values[2]).toBe('2');
			expect(values[3]).toBe('3');
			expect(values[4]).toBe('');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If an element has a datalist element ancestor, it is barred from constraint validation',
		({ document }) => {
			expect((document.getElementById('num') as HTMLSelectElement).willValidate).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
