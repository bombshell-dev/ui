import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!doctype html>
<meta charset=utf-8>
<title>HTMLSelectElement selectedIndex</title>


<div id=log></div>

<form id=form>
  <select id=empty></select>

  <select id=default>
    <option></option>
    <option></option>
    <option></option>
    <option></option>
    <option></option>
  </select>

  <select id=disabled>
    <option disabled></option>
    <option></option>
  </select>

  <select id=selected>
    <option></option>
    <option selected></option>
  </select>

  <select id=display-none>
    <option style="display:none"></option>
    <option></option>
  </select>

  <select id=minus-one>
    <option value=1>1</option>
    <option value=2>2</option>
  </select>
</form>


`;
		function assertSelectedIndex(select: HTMLSelectElement, value: number) {
			expect(select.selectedIndex).toBe(value);
			expect(select.options.selectedIndex).toBe(value);
		}
		function assertSelectValue(select: HTMLSelectElement, value: string) {
			expect(select.value).toBe(value);
		}

		context.test(
			'get empty',
			({ document }) => {
				let select = document.getElementById('empty') as HTMLSelectElement;
				assertSelectedIndex(select, -1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'get default',
			({ document }) => {
				let select = document.getElementById('default') as HTMLSelectElement;
				assertSelectedIndex(select, 0);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'get disabled',
			({ document }) => {
				let select = document.getElementById('disabled') as HTMLSelectElement;
				assertSelectedIndex(select, 1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'get unselected',
			({ document }) => {
				let select = document.getElementById('selected') as HTMLSelectElement;
				assertSelectedIndex(select, 1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'set empty (HTMLSelectElement)',
			({ document }) => {
				let select = document.getElementById('empty') as HTMLSelectElement;
				select.selectedIndex = 1;
				assertSelectedIndex(select, -1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'set empty (HTMLOptionsCollection)',
			({ document }) => {
				let select = document.getElementById('empty') as HTMLSelectElement;
				select.options.selectedIndex = 1;
				assertSelectedIndex(select, -1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'set (HTMLSelectElement)',
			({ document, cleanup }) => {
				let select = document.getElementById('default') as HTMLSelectElement;
				assertSelectedIndex(select, 0);
				select.selectedIndex = 2;
				assertSelectedIndex(select, 2);
				cleanup(() => {
					select.selectedIndex = 0;
				});
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'set (HTMLOptionsCollection)',
			({ document, cleanup }) => {
				let select = document.getElementById('default') as HTMLSelectElement;
				assertSelectedIndex(select, 0);
				select.options.selectedIndex = 2;
				assertSelectedIndex(select, 2);
				cleanup(() => {
					select.selectedIndex = 0;
				});
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'set and reset (HTMLSelectElement)',
			({ document }) => {
				let select = document.getElementById('selected') as HTMLSelectElement;
				let form = document.getElementById('form') as HTMLFormElement;
				assertSelectedIndex(select, 1);
				select.selectedIndex = 0;
				assertSelectedIndex(select, 0);
				form.reset();
				assertSelectedIndex(select, 1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'set and reset (HTMLOptionsCollection)',
			({ document }) => {
				let select = document.getElementById('selected') as HTMLSelectElement;
				let form = document.getElementById('form') as HTMLFormElement;
				assertSelectedIndex(select, 1);
				select.options.selectedIndex = 0;
				assertSelectedIndex(select, 0);
				form.reset();
				assertSelectedIndex(select, 1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'get display:none',
			({ document }) => {
				let select = document.getElementById('display-none') as HTMLSelectElement;
				assertSelectedIndex(select, 0);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'reset to display:none',
			({ document }) => {
				let select = document.getElementById('display-none') as HTMLSelectElement;
				select.offsetTop; // force rendering
				assertSelectedIndex(select, 0);
				select.options[1]!.selected = true;
				assertSelectedIndex(select, 1);
				select.options[1]!.selected = false;
				assertSelectedIndex(select, 0);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'set selectedIndex=-1',
			({ document }) => {
				let select = document.getElementById('minus-one') as HTMLSelectElement;
				assertSelectedIndex(select, 0);

				select.selectedIndex = -1;

				assertSelectedIndex(select, -1);
				assertSelectValue(select, '');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'removing a non-selected option with nothing selected asks for a reset',
			({ document, cleanup }) => {
				let select = document.createElement('select');
				select.innerHTML = `
    <option value="placeholder">placeholder</option>
    <option value="{{item}}">foobar</option>`;
				document.body.appendChild(select);
				cleanup(() => {
					select.remove();
				});

				assertSelectedIndex(select, 0);

				select.value = 'foobar';
				assertSelectedIndex(select, -1);
				assertSelectValue(select, '');

				select.options[1]!.setAttribute('value', 'foobar');
				assertSelectedIndex(select, -1);
				assertSelectValue(select, '');

				select.options[0]!.remove();
				assertSelectedIndex(select, 0);
				assertSelectValue(select, 'foobar');
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
