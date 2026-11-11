import type { CompatibilityContext } from '../../../../../../shared/context.ts';

const markup = `<!DOCTYPE html>







<style>
select, ::picker(select) {
  appearance: base-select;
}
</style>

<form>
  <select>
    <button>
      <selectedcontent></selectedcontent>
    </button>
    <option class=one value=one>
      <span class=one>span</span> one
    </option>
    <option class=two value=two>
      <span class=two>span</span> two
    </option>
  </select>
</form>



<select id=select2>
  <button>
    <selectedcontent></selectedcontent>
  </button>
  <option class=one>one</option>
  <option class=two>two</option>
  <option class=three>three</option>
</select>


`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function makeOptionSelectedSelect(document: Document) {
		const select = document.createElement('select');
		select.innerHTML = `
    <button><selectedcontent></selectedcontent></button>
    <option class=one><span class=one>span</span> one</option>
    <option class=two><span class=two>span</span> two</option>`;
		document.body.appendChild(select);
		return select;
	}
	context.test(
		'When there are multiple <selectedcontent> elements, both of them should be kept up to date.',
		async ({ document }) => {
			const select = document.getElementById('select2') as HTMLSelectElement;
			const button = select.querySelector('button')!;
			const selectedcontent = select.querySelector('selectedcontent')!;
			expect(selectedcontent.textContent, 'selectedcontent should initially be one.').toBe('one');

			const selectedcontent2 = document.createElement('selectedcontent');
			button.appendChild(selectedcontent2);
			select.value = 'two';
			expect(selectedcontent.textContent, 'First selectedcontent should be kept up to date.').toBe(
				'two',
			);
			expect(
				selectedcontent2.textContent,
				'Second selectedcontent should be kept up to date.',
			).toBe('two');

			button.insertBefore(selectedcontent2, selectedcontent);
			select.value = 'one';
			expect(
				selectedcontent.textContent,
				'Second selectedcontent in tree order should be kept up to date after another is inserted.',
			).toBe('one');
			expect(
				selectedcontent2.textContent,
				'First selectedcontent in tree order should be kept up to date.',
			).toBe('one');

			selectedcontent.textContent = 'two';
			selectedcontent.remove();
			expect(
				selectedcontent.textContent,
				'selectedcontent should not have its children modified after removal.',
			).toBe('two');

			select.value = 'three';
			expect(
				selectedcontent2.textContent,
				'Remaining selectedcontent should be kept up to date.',
			).toBe('three');
			expect(
				selectedcontent.textContent,
				'Removed selectedcontent should not be kept up to date.',
			).toBe('two');

			button.insertBefore(selectedcontent, selectedcontent2);
			expect(selectedcontent.textContent, 'Inserted selectedcontent should be updated.').toBe(
				'three',
			);
			expect(
				selectedcontent2.textContent,
				'Second selectedcontent in tree order should be updated when another is inserted.',
			).toBe('three');

			selectedcontent.remove();
			expect(
				selectedcontent2.textContent,
				'Remaining selectedcontent should be updated when first in tree order is removed.',
			).toBe('three');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'<seletedcontent> behavior in disconnected <select>.',
		async ({ document }) => {
			const select = document.createElement('select');
			select.innerHTML = '<option>one</option><option>two</option>';
			const button = document.createElement('button');
			select.appendChild(button);

			const selectedcontent = document.createElement('selectedcontent');
			button.appendChild(selectedcontent);
			expect(
				selectedcontent.textContent,
				'<selectedcontent> should not be updated when appending to a disconnected select.',
			).toBe('');

			select.value = 'two';
			expect(
				selectedcontent.textContent,
				'<selectedcontent> should be updated when changing value of a disconnected select.',
			).toBe('two');
			selectedcontent.innerHTML = '';

			document.body.appendChild(select);
			expect(
				selectedcontent.textContent,
				'<selectedcontent> should be updated when <select> is connected to the document.',
			).toBe('two');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Setting HTMLOptionElement.selected updates the <selectedcontent>.',
		({ document }) => {
			const select = makeOptionSelectedSelect(document);
			const optionTwo = select.querySelector<HTMLOptionElement>('option.two')!;
			const selectedcontent = select.querySelector('selectedcontent')!;

			expect(
				selectedcontent.innerHTML,
				'The <selectedcontent> should initially reflect the selected <option>.',
			).toBe(select.querySelector<HTMLOptionElement>('option.one')!.innerHTML);

			optionTwo.selected = true;
			expect(
				selectedcontent.innerHTML,
				'Setting HTMLOptionElement.selected should synchronously update the <selectedcontent>.',
			).toBe(optionTwo.innerHTML);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Setting the option selected attribute updates the <selectedcontent>.',
		({ document }) => {
			const select = makeOptionSelectedSelect(document);
			const optionTwo = select.querySelector<HTMLOptionElement>('option.two')!;
			const selectedcontent = select.querySelector('selectedcontent')!;

			optionTwo.setAttribute('selected', '');
			expect(
				selectedcontent.innerHTML,
				'Setting the selected content attribute should synchronously update the <selectedcontent>.',
			).toBe(optionTwo.innerHTML);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Setting HTMLOptionElement.selected does not cause a redundant async selectedcontent update.',
		async ({ document, MutationObserver }) => {
			const select = makeOptionSelectedSelect(document);
			const optionTwo = select.querySelector<HTMLOptionElement>('option.two')!;
			const selectedcontent = select.querySelector('selectedcontent')!;
			let mutationCount = 0;
			const observer = new MutationObserver(() => mutationCount++);
			observer.observe(selectedcontent, { childList: true, subtree: true });

			optionTwo.selected = true;
			expect(
				selectedcontent.innerHTML,
				'The <selectedcontent> should be updated synchronously.',
			).toBe(optionTwo.innerHTML);

			// Wait a task to ensure no redundant async update fires.
			await new Promise((resolve) => setTimeout(resolve, 0));
			expect(
				mutationCount,
				'Only one mutation batch should fire (the synchronous update), not a redundant async one.',
			).toBe(1);
			observer.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'form.reset() updates <selectedcontent> when an option has the selected attribute.',
		({ document }) => {
			const form = document.createElement('form');
			form.innerHTML = `
    <select>
      <button><selectedcontent></selectedcontent></button>
      <option class=one value=one>one</option>
      <option class=two value=two selected>two</option>
    </select>`;
			document.body.appendChild(form);
			const select = form.querySelector('select')!;
			const optionOne = select.querySelector<HTMLOptionElement>('option.one')!;
			const optionTwo = select.querySelector<HTMLOptionElement>('option.two')!;
			const selectedcontent = select.querySelector('selectedcontent')!;

			expect(
				selectedcontent.innerHTML,
				'The <selectedcontent> should initially reflect the option with the selected attribute.',
			).toBe(optionTwo.innerHTML);

			select.value = 'one';
			expect(
				selectedcontent.innerHTML,
				'Changing select.value should update the <selectedcontent>.',
			).toBe(optionOne.innerHTML);

			form.reset();
			expect(select.value, 'form.reset() should restore select.value to two.').toBe('two');
			expect(
				selectedcontent.innerHTML,
				'form.reset() should update the <selectedcontent> to the default selected option.',
			).toBe(optionTwo.innerHTML);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Setting HTMLOptionElement.selected = false updates the <selectedcontent>.',
		({ document }) => {
			const select = makeOptionSelectedSelect(document);
			const optionOne = select.querySelector<HTMLOptionElement>('option.one')!;
			const optionTwo = select.querySelector<HTMLOptionElement>('option.two')!;
			const selectedcontent = select.querySelector('selectedcontent')!;

			optionTwo.selected = true;
			expect(selectedcontent.innerHTML).toBe(optionTwo.innerHTML);

			optionTwo.selected = false;
			expect(
				select.value,
				'Deselecting the second option in single-select should fall back to selecting the first enabled option.',
			).toBe(optionOne.value);
			expect(
				selectedcontent.innerHTML,
				'Setting HTMLOptionElement.selected = false should update <selectedcontent> to the newly selected option.',
			).toBe(optionOne.innerHTML);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Re-assigning option.selected = true updates the <selectedcontent>.',
		({ document }) => {
			const select = makeOptionSelectedSelect(document);
			const optionOne = select.querySelector<HTMLOptionElement>('option.one')!;
			const selectedcontent = select.querySelector('selectedcontent')!;

			expect(selectedcontent.innerHTML).toBe(optionOne.innerHTML);

			optionOne.innerHTML = '<span class=modified>modified span</span> one';
			expect(
				selectedcontent.innerHTML,
				'<selectedcontent> should not automatically observe DOM modifications inside <option>.',
			).not.toBe(optionOne.innerHTML);

			optionOne.selected = true;
			expect(
				selectedcontent.innerHTML,
				'Re-assigning option.selected = true should update <selectedcontent> with the modified option contents.',
			).toBe(optionOne.innerHTML);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Setting option.selected = false in a listbox clears the <selectedcontent>.',
		({ document }) => {
			const select = document.createElement('select');
			select.size = 2;
			select.innerHTML = `
    <button><selectedcontent></selectedcontent></button>
    <option class=one selected>one</option>
    <option class=two>two</option>`;
			document.body.appendChild(select);
			const optionOne = select.querySelector<HTMLOptionElement>('option.one')!;
			const selectedcontent = select.querySelector('selectedcontent')!;

			expect(selectedcontent.innerHTML).toBe(optionOne.innerHTML);

			optionOne.selected = false;
			expect(
				selectedcontent.innerHTML,
				'Setting option.selected = false in a listbox where no option remains selected should clear <selectedcontent>.',
			).toBe('');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Removing an unselected option when another option became enabled updates <selectedcontent>.',
		async ({ document }) => {
			const select = document.createElement('select');
			select.innerHTML = `
    <button><selectedcontent></selectedcontent></button>
    <option id=a disabled>A</option>
    <option id=b disabled>B</option>`;
			document.body.appendChild(select);
			const a = select.querySelector<HTMLOptionElement>('#a')!;
			const b = select.querySelector<HTMLOptionElement>('#b')!;
			const selectedcontent = select.querySelector('selectedcontent')!;

			expect(select.value).toBe('');
			expect(selectedcontent.innerHTML).toBe('');

			a.disabled = false;
			b.remove();
			expect(select.value).toBe('A');

			await new Promise<void>(queueMicrotask);
			expect(
				selectedcontent.innerHTML,
				'Removing an unselected option that triggers selectedness setting should update <selectedcontent> after microtask.',
			).toBe(a.innerHTML);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
