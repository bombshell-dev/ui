import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = '<!doctype html><div id="container"></div>';
	function assert_element_states(
		elements: HTMLDetailsElement[],
		expectations: number[],
		description: string,
	) {
		{
			const actual = elements.map((e) => Number(e.open));
			const expected = expectations;
			expect(actual.length, description).toBe(expected.length);
			for (let index = 0; index < expected.length; index++)
				expect(actual[index], description).toBe(expected[index]);
		}
	}
	context.test(
		'basic handling of mutually exclusive details',
		async ({ document }) => {
			const container = document.getElementById('container')!;

			container.innerHTML = `
    <details name="a">
      <summary>1</summary>
      This is the first item.
    </details>

    <details name="a">
      <summary>2</summary>
      This is the second item.
    </details>
  `;
			let first = container.firstElementChild as HTMLDetailsElement;
			let second = first.nextElementSibling as HTMLDetailsElement;
			expect(first.open).toBe(false);
			expect(second.open).toBe(false);
			first.open = true;
			expect(first.open).toBe(true);
			expect(second.open).toBe(false);
			second.open = true;
			expect(first.open).toBe(false);
			expect(second.open).toBe(true);
			second.open = true;
			expect(first.open).toBe(false);
			expect(second.open).toBe(true);
			second.open = false;
			expect(first.open).toBe(false);
			expect(second.open).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'more complex handling of mutually exclusive details',
		async ({ document }) => {
			const container = document.getElementById('container')!;

			container.innerHTML = `
    <details name="a" open>
      <summary>1</summary>
      This is the first item.
    </details>

    <details name="a">
      <summary>2</summary>
      This is the second item.
    </details>

    <details name="a" open>
      <summary>3</summary>
      This is the third item.
    </details>
  `;
			let first = container.firstElementChild as HTMLDetailsElement;
			let second = first.nextElementSibling as HTMLDetailsElement;
			let third = second.nextElementSibling as HTMLDetailsElement;
			function assert_states(
				expected_first: boolean,
				expected_second: boolean,
				expected_third: boolean,
				description: string,
			) {
				expect([first.open, second.open, third.open], description).toHaveLength(3);
				expect([first.open, second.open, third.open][0], description).toBe(expected_first);
				expect([first.open, second.open, third.open][1], description).toBe(expected_second);
				expect([first.open, second.open, third.open][2], description).toBe(expected_third);
			}

			assert_states(true, false, false, 'initial states from open attribute');
			first.open = true;
			assert_states(true, false, false, "non-mutation doesn't change state");
			second.open = true;
			assert_states(false, true, false, 'mutation closes multiple open elements');
			third.setAttribute('open', '');
			assert_states(false, false, true, 'setAttribute closes other open element');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'mutually exclusive details across multiple names and multiple tree scopes',
		async ({ document }) => {
			const container = document.getElementById('container')!;

			let details_elements_string = `
    <details name="a"></details>
    <details name="a" open></details>
    <details name="b"></details>
    <details name="b"></details>
  `;
			container.innerHTML = `
    ${details_elements_string}
    <div id="shadow_host"></div>
  `;
			let shadow_root = (document.getElementById('shadow_host') as HTMLDetailsElement).attachShadow(
				{ mode: 'open' },
			);
			shadow_root.innerHTML = details_elements_string;
			let elements = Array.from(container.querySelectorAll('details')).concat(
				Array.from(shadow_root.querySelectorAll('details')),
			);

			assert_element_states(
				elements,
				[0, 1, 0, 0, 0, 1, 0, 0],
				'initial states from open attribute',
			);
			elements[4]!.open = true;
			assert_element_states(elements, [0, 1, 0, 0, 1, 0, 0, 0], 'after mutation in shadow tree');
			for (let i = 0; i < 8; ++i) {
				elements[i]!.open = true;
			}
			assert_element_states(elements, [0, 1, 0, 1, 0, 1, 0, 1], 'after setting all elements open');
			elements[0]!.open = true;
			assert_element_states(elements, [1, 0, 0, 1, 0, 1, 0, 1], 'after final mutation');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'empty and missing name attributes do not create groups',
		async ({ document }) => {
			const container = document.getElementById('container')!;

			container.innerHTML = `
    <details></details>
    <details></details>
    <details name></details>
    <details name></details>
    <details name=""></details>
    <details name=""></details>
  `;
			let elements = Array.from(container.querySelectorAll('details'));

			assert_element_states(elements, [0, 0, 0, 0, 0, 0], 'initial states from open attribute');
			for (let i = 0; i < 6; ++i) {
				elements[i]!.open = true;
			}
			assert_element_states(elements, [1, 1, 1, 1, 1, 1], 'after setting all elements open');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		"closing as a result of parsing doesn't depend on attribute order",
		async ({ document }) => {
			const container = document.getElementById('container')!;

			container.innerHTML = `
    <details name="a" id="e0" open></details>
    <details name="a" id="e1" open></details>
    <details open name="a" id="e2"></details>
  `;
			let elements = [
				document.getElementById('e0') as HTMLDetailsElement,
				document.getElementById('e1') as HTMLDetailsElement,
				document.getElementById('e2') as HTMLDetailsElement,
			];

			assert_element_states(elements, [1, 0, 0], 'states after insertion by parser');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		"basic handling of mutually exclusive details when the element isn't connected",
		async ({ document }) => {
			const container = document.getElementById('container')!;

			container.remove();
			container.innerHTML = `
    <details name="a">
      <summary>1</summary>
      This is the first item.
    </details>

    <details name="a">
      <summary>2</summary>
      This is the second item.
    </details>
  `;
			let first = container.firstElementChild as HTMLDetailsElement;
			let second = first.nextElementSibling as HTMLDetailsElement;
			expect(first.open).toBe(false);
			expect(second.open).toBe(false);
			first.open = true;
			expect(first.open).toBe(true);
			expect(second.open).toBe(false);
			second.open = true;
			expect(first.open).toBe(false);
			expect(second.open).toBe(true);
			second.open = true;
			expect(first.open).toBe(false);
			expect(second.open).toBe(true);
			second.open = false;
			expect(first.open).toBe(false);
			expect(second.open).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
