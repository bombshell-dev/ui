import { describe, expect, test, vi } from 'vitest';
import { Dialog } from './dialog.ts';
import { createHost } from '../host.ts';

describe('dialog', () => {
	test('keeps its implementation and projected body across reconnects', () => {
		const host = createHost();
		Dialog.register(host);
		const child = host.createElement('text', {}, 'middle');
		const dialog = host.createElement('dialog', 'before ', child, ' after');
		host.element.append(dialog);
		const panel = dialog.children[0];
		const body = dialog.childrenContainer!;
		host.removeChild(host.element, dialog);
		dialog.append(' detached');
		host.element.append(dialog);
		expect(dialog.children).toEqual([panel]);
		expect(dialog.childrenContainer).toBe(body);
		expect(body.childNodes.filter((node) => node === child)).toHaveLength(1);
		expect(dialog.textContent).toBe('before middle after detached');
	});

	test('preserves literal content in its body slot', () => {
		const host = createHost();
		Dialog.register(host);
		const dialog = host.createElement('dialog', {}, 'body content');
		host.element.append(dialog);

		expect(dialog.childrenContainer?.textContent).toBe('body content');
		expect(dialog.childrenContainer?.childNodes).toMatchObject([
			{ type: 'literal', content: 'body content' },
		]);
	});

	test('composes a panel from text, box, and button elements', () => {
		const host = createHost();
		Dialog.register(host);
		const body = host.createElement('text', {}, 'A file already exists.');
		const dialog = host.createElement(
			'dialog',
			{ title: 'Overwrite?', message: 'Choose an action.' },
			body,
		);
		host.element.append(dialog);

		const panel = dialog.children[0];
		expect(panel).toMatchObject({ type: 'element', name: 'box' });
		if (!panel || panel.type !== 'element') return;

		expect(
			panel.childNodes.map((child) => (child.type === 'element' ? child.name : child.content)),
		).toEqual(['text', 'text', 'box', 'box']);
		const content = panel.children[2];
		if (content?.type !== 'element') return;
		expect(content.children).toContain(body);
	});

	test('updates existing children and emits dialog events from its buttons', () => {
		const host = createHost();
		Dialog.register(host);
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
		confirm.emit({ type: 'press' });
		cancel.emit({ type: 'press' });

		expect(title.textContent).toBe('After');
		expect(confirm.properties.label).toBe('Proceed');
		expect(cancel.properties.label).toBe('Back');
		expect(confirmed).toHaveBeenCalledOnce();
		expect(cancelled).toHaveBeenCalledOnce();
	});

	test('routes public child operations through its content slot', () => {
		const host = createHost();
		Dialog.register(host);
		const first = host.createElement('text', {}, 'first');
		const second = host.createElement('text', {}, 'second');
		const dialog = host.createElement('dialog', {}, first, second);
		host.element.append(dialog);
		const panel = dialog.children[0];
		if (panel?.type !== 'element') return;
		const body = panel.children[2];
		if (body?.type !== 'element') return;

		dialog.prepend('before ', 'first ');
		expect(body.textContent).toBe('before first firstsecond');
		dialog.replaceChildren('replacement');
		expect(dialog.children).toEqual([panel]);
		expect(body.textContent).toBe('replacement');
		dialog.textContent = 'updated';
		expect(dialog.children).toEqual([panel]);
		expect(body.textContent).toBe('updated');
	});
});
