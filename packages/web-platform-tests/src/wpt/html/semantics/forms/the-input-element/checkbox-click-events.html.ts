import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'clicking and preventDefaulting a checkbox causes the checkbox to be checked during the click handler but reverted',
		({ document }) => {
			const input = document.createElement('input');
			input.type = 'checkbox';

			const values: boolean[] = [];

			input.addEventListener('click', (e) => {
				values.push(input.checked);
				e.preventDefault();
				values.push(input.checked);
			});

			input.click();

			values.push(input.checked);
			expect(values).toHaveLength(3);
			expect(values[0]).toBe(true);
			expect(values[1]).toBe(true);
			expect(values[2]).toBe(false);
		},
	);
	context.test(
		'a checkbox input emits click, input, change events in order after synthetic click',
		({ document }) => {
			const input = document.createElement('input');
			input.type = 'checkbox';
			document.body.appendChild(input);
			const events: string[] = [];

			input.addEventListener('change', () => {
				events.push('change');
			});
			input.addEventListener('click', () => {
				events.push('click');
			});
			input.addEventListener('input', () => {
				events.push('input');
			});

			expect(input.checked).toBe(false);

			input.click();

			expect(input.checked).toBe(true);
			expect(events).toHaveLength(3);
			expect(events[0]).toBe('click');
			expect(events[1]).toBe('input');
			expect(events[2]).toBe('change');
		},
	);
	context.test(
		'a checkbox input emits click, input, change events in order after dispatching click event',
		({ document, MouseEvent }) => {
			const input = document.createElement('input');
			input.type = 'checkbox';
			document.body.appendChild(input);
			const events: string[] = [];

			input.addEventListener('change', () => {
				events.push('change');
			});
			input.addEventListener('click', () => {
				events.push('click');
			});
			input.addEventListener('input', () => {
				events.push('input');
			});

			expect(input.checked).toBe(false);

			const event = new MouseEvent('click', { bubbles: true, cancelable: true });
			input.dispatchEvent(event);

			expect(input.checked).toBe(true);
			expect(events).toHaveLength(3);
			expect(events[0]).toBe('click');
			expect(events[1]).toBe('input');
			expect(events[2]).toBe('change');
		},
	);
	context.test('checkbox input respects cancel behavior on synthetic clicks', ({ document }) => {
		const input = document.createElement('input');
		input.type = 'checkbox';
		document.body.appendChild(input);
		const events: string[] = [];

		input.addEventListener('change', () => {
			events.push('change');
		});
		input.addEventListener('click', (e) => {
			e.preventDefault();
			events.push('click');
		});
		input.addEventListener('input', () => {
			events.push('input');
		});

		expect(input.checked).toBe(false);

		input.click();

		expect(input.checked).toBe(false);
		expect(events).toHaveLength(1);
		expect(events[0]).toBe('click');
	});
}
