import { describe, expect, test, vi } from 'vitest';
import { installBuiltins } from '../builtins.ts';
import { emit } from '../emit.ts';
import { createHost } from '../host.ts';

describe('dialog', () => {
	test('composes a panel from text, box, and button elements', () => {
		const host = createHost();
		installBuiltins(host);
		const body = host.createElement('text', {}, 'A file already exists.');
		const dialog = host.createElement(
			'dialog',
			{ title: 'Overwrite?', message: 'Choose an action.' },
			body,
		);
		host.element.append(dialog);

		const panel = dialog.children[0];
		expect(panel).toMatchObject({ type: 'element', name: 'box' });
		if (panel.type !== 'element') return;

		expect(panel.children.map((child) => (child.type === 'element' ? child.name : child.content))).toEqual([
			'text',
			'text',
			'box',
			'box',
		]);
		const content = panel.children[2];
		if (content?.type !== 'element') return;
		expect(content.children).toContain(body);
	});

	test('updates existing children and emits dialog events from its buttons', () => {
		const host = createHost();
		installBuiltins(host);
		const dialog = host.createElement('dialog', {
			title: 'Before',
			confirmLabel: 'Yes',
			cancelLabel: 'No',
		});
		host.element.append(dialog);

		const panel = dialog.children[0];
		if (panel?.type !== 'element') return;
		const title = panel.children[0];
		const actions = panel.children[3];
		if (title?.type !== 'element' || actions?.type !== 'element') return;
		const cancel = actions.children[0];
		const confirm = actions.children[1];
		if (cancel?.type !== 'element' || confirm?.type !== 'element') return;

		const confirmed = vi.fn();
		const cancelled = vi.fn();
		dialog.addEventListener('confirm', confirmed);
		dialog.addEventListener('cancel', cancelled);

		dialog.setProperty('title', 'After');
		dialog.setProperty('confirmLabel', 'Proceed');
		dialog.setProperty('cancelLabel', 'Back');
		emit(confirm.node!, { type: 'press' });
		emit(cancel.node!, { type: 'press' });

		expect(title.textContent).toBe('After');
		expect(confirm.properties.label).toBe('Proceed');
		expect(cancel.properties.label).toBe('Back');
		expect(confirmed).toHaveBeenCalledOnce();
		expect(cancelled).toHaveBeenCalledOnce();
	});
});
