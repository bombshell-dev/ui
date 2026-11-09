import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'radio input emits click, input, change events in order after synthetic click',
		({ document }) => {
			const input = document.createElement('input');
			input.type = 'radio';
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
		'radio input emits click, input, change events in order after dispatching click event',
		({ document, MouseEvent }) => {
			const input = document.createElement('input');
			input.type = 'radio';
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
	context.test('checked radio input emits only click event on click ', ({ document }) => {
		const input = document.createElement('input');
		input.type = 'radio';
		input.checked = true;
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

		input.click();

		expect(events).toHaveLength(1);
		expect(events[0]).toBe('click');
	});
	context.test('radio input synthetic click respects cancelling behaviour', ({ document }) => {
		const input = document.createElement('input');
		input.type = 'radio';
		document.body.appendChild(input);
		const events: string[] = [];

		input.addEventListener('change', () => {
			events.push('change');
		});
		input.addEventListener('click', (e) => {
			// cancel click event
			e.preventDefault();
			events.push('click');
		});
		input.addEventListener('input', () => {
			events.push('input');
		});

		expect(input.checked).toBe(false);

		input.click();

		expect(input.checked).toBe(false);

		// only click event called
		expect(events).toHaveLength(1);
		expect(events[0]).toBe('click');
	});
}
