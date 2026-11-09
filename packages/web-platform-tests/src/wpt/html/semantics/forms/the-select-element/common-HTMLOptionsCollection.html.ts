import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title id='title'>HTMLOptionsCollection</title>


<div id="log"></div>
<select id="selly">
  <option>1</option>
  <option>2</option>
  <option>3</option>
  <option>4</option>
</select>


`;
	context.test(
		'On getting, the length attribute must return the number of nodes represented by the collection.',
		({ document }) => {
			const selly = document.getElementById('selly') as HTMLSelectElement;

			expect(selly.length).toBe(4);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Changing the length adds new nodes; The number of new nodes = new length minus old length',
		({ document }) => {
			const selly = document.getElementById('selly') as HTMLSelectElement;

			selly.length = 7;
			expect(selly.length, 'Number of nodes in collection should have changed').toBe(7);
			expect(selly.children.length, 'Number of children should have changed').toBe(7);
			for (let i = 4; i < 7; ++i) {
				let child = selly.children[i]!;
				expect(child.localName, 'new child should be an option').toBe('option');
				expect(child.namespaceURI, 'new child should be an HTML element').toBe(
					'http://www.w3.org/1999/xhtml',
				);
				expect(child.attributes.length, 'new child should not have attributes').toBe(0);
				expect(child.childNodes.length, 'new child should not have child nodes').toBe(0);
			}
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'New nodes have no value',
		({ document }) => {
			// Recreate mutations performed by the preceding upstream cases.
			const selly = document.getElementById('selly') as HTMLSelectElement;
			selly.length = 7;

			let elarray = [];
			for (let i = 0; i < selly.length; i++) {
				elarray.push((selly[i] as HTMLOptionElement).value);
			}
			expect(elarray).toHaveLength(7);
			expect(elarray[0]).toBe('1');
			expect(elarray[1]).toBe('2');
			expect(elarray[2]).toBe('3');
			expect(elarray[3]).toBe('4');
			expect(elarray[4]).toBe('');
			expect(elarray[5]).toBe('');
			expect(elarray[6]).toBe('');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Setting a length equal to existing length changes nothing',
		({ document }) => {
			// Recreate mutations performed by the preceding upstream cases.
			const selly = document.getElementById('selly') as HTMLSelectElement;
			selly.length = 7;

			selly.length = 7;
			expect(selly.length, 'Number of nodes in collection should not have changed').toBe(7);
			expect(selly.children.length, 'Number of children should not have changed').toBe(7);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Setting a length lower than the old length trims nodes from the end',
		({ document }) => {
			// Recreate mutations performed by the preceding upstream cases.
			const selly = document.getElementById('selly') as HTMLSelectElement;
			selly.length = 7;

			selly.length = 4;
			expect(selly[6], 'previously set node is now undefined').toBe(undefined);
			expect(selly.length, 'Number of nodes in collection is correctly changed').toBe(4);
			expect(selly.children.length, 'Number of children should have changed').toBe(4);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Setting element to null by index removed the element',
		({ document }) => {
			// Recreate mutations performed by the preceding upstream cases.
			const selly = document.getElementById('selly') as HTMLSelectElement;
			selly.length = 7;
			selly.length = 4;

			let opts = selly.options;
			(opts as unknown as Record<number, HTMLOptionElement | null>)[3] = null;
			expect(selly[3], 'previously set node is now undefined').toBe(undefined);
			expect(selly.length, 'Number of nodes in collection is correctly changed').toBe(3);
			expect(selly.children.length, 'Number of children should have changed').toBe(3);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Setting element by index should correctly append and replace elements',
		({ document }) => {
			// Recreate mutations performed by the preceding upstream cases.
			const selly = document.getElementById('selly') as HTMLSelectElement;
			selly.length = 7;
			selly.length = 4;
			(selly.options as unknown as Record<number, HTMLOptionElement | null>)[3] = null;

			let opts = selly.options;
			let new_option = document.createElement('option');
			let replace_option = new_option.cloneNode(true) as HTMLOptionElement;
			new_option.value = '-1';
			replace_option.value = 'a';
			opts[5] = new_option;
			opts[0] = replace_option;

			let elarray = [];
			for (let i = 0; i < selly.length; i++) {
				elarray.push((selly[i] as HTMLOptionElement).value);
			}
			expect(elarray).toHaveLength(6);
			expect(elarray[0]).toBe('a');
			expect(elarray[1]).toBe('2');
			expect(elarray[2]).toBe('3');
			expect(elarray[3]).toBe('');
			expect(elarray[4]).toBe('');
			expect(elarray[5]).toBe('-1');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		"Changing the length adds new nodes; The new nodes will not copy select's prefix",
		({ document }) => {
			const selly = document.getElementById('selly') as HTMLSelectElement;

			let selection = document.createElementNS(
				'http://www.w3.org/1999/xhtml',
				'foo:select',
			) as HTMLSelectElement;

			selection.length = 5;
			expect(selection.length, 'Number of nodes in collection should have changed').toBe(5);
			for (let i = 0; i < 5; ++i) {
				let child = selection.children[i]!;
				expect(child.localName, 'new child should be an option').toBe('option');
				expect(child.namespaceURI, 'new child should be an HTML element').toBe(
					'http://www.w3.org/1999/xhtml',
				);
				expect(child.prefix, "new child should not copy select's prefix").toBe(null);
			}
		},
		{ document: { contentType: 'text/html', content } },
	);
}
