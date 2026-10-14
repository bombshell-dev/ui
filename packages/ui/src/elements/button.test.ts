import { describe, expect, test, vi } from 'vitest';
import { Button } from './button.ts';
import { createHost } from '../host.ts';
import { FocusApi, getFocus, setFocus } from '../focus.ts';
import { rgba } from '../values.ts';

describe('button', () => {
	test('updates eligibility and local styling when disabled without a focus transition', () => {
		const host = createHost();
		Button.register(host);
		const first = host.createElement('button', { label: 'First' });
		const second = host.createElement('button', { label: 'Second' });
		host.element.append(first, second);
		expect(getFocus(host.root)).toBe(first.node);
		const box = second.childrenContainer!;
		const label = box.children[0];
		second.setProperty('disabled', true);
		expect(FocusApi.at(host.root).canFocus(second.node!)).toBe(false);
		expect(box.properties.border).toMatchObject({ color: rgba(80, 80, 80) });
		expect(label.properties.color).toBe(rgba(100, 100, 100));
		expect(second.keydown?.({ type: 'keydown', key: 'Enter', code: 'Enter' })).toBe(false);
		second.setProperty('disabled', false);
		expect(FocusApi.at(host.root).canFocus(second.node!)).toBe(true);
		expect(box.properties.border).toMatchObject({ color: rgba(100, 100, 100) });
		setFocus(second.node!);
		expect(box.properties.border).toMatchObject({ color: rgba(255, 255, 255) });
		expect(label.properties.color).toBe(rgba(255, 255, 255));
		second.setProperty('disabled', true);
		expect(getFocus(host.root)).not.toBe(second.node);
		expect(box.properties.border).toMatchObject({ color: rgba(80, 80, 80) });
	});

	test('cleans up focus and restores its persistent view on reconnect', () => {
		const host = createHost();
		Button.register(host);
		const button = host.createElement('button', { label: 'Save' });
		host.element.append(button);
		const box = button.childrenContainer!;
		expect(getFocus(host.root)).toBe(button.node);
		host.removeChild(host.element, button);
		expect(getFocus(host.root)).toBe(host.root);
		expect(box.properties.border).toMatchObject({ color: rgba(100, 100, 100) });
		host.element.append(button);
		expect(getFocus(host.root)).toBe(button.node);
		expect(button.childrenContainer).toBe(box);
		expect(box.properties.border).toMatchObject({ color: rgba(255, 255, 255) });
	});

	test('preserves caller-provided literal content instead of generating a label', () => {
		const host = createHost();
		Button.register(host);
		const button = host.createElement('button', { label: 'fallback' }, 'provided');
		host.element.append(button);

		expect(button.textContent).toBe('provided');
		expect(button.childrenContainer?.childNodes).toMatchObject([
			{ type: 'literal', content: 'provided' },
		]);
	});

	test('composes its label from persistent box and text children', () => {
		const host = createHost();
		Button.register(host);
		const button = host.createElement('button', { label: 'Save' });
		host.element.append(button);

		const box = button.children[0];
		expect(box).toMatchObject({ type: 'element', name: 'box' });
		if (!box || box.type !== 'element') return;
		expect(box.properties.border).toMatchObject({ top: 1, right: 1, bottom: 1, left: 1 });
		expect(box.properties.layout).toMatchObject({ padding: { left: 1, right: 1 } });
		const label = box.children[0];
		expect(label).toMatchObject({ type: 'element', name: 'text' });
		if (!label || label.type !== 'element') return;

		button.setProperty('label', 'Submit');

		expect(button.children[0]).toBe(box);
		expect(box.children[0]).toBe(label);
		expect(label.textContent).toBe('Submit');
	});

	test('activates on a terminal space-key event', () => {
		const host = createHost();
		Button.register(host);
		const button = host.createElement('button', { label: 'Save' });
		const pressed = vi.fn();
		const clicked = vi.fn();
		button.addEventListener('press', pressed);
		button.addEventListener('click', clicked);
		host.element.append(button);
		const label = button.childrenContainer?.children[0];
		if (label?.type !== 'element') return;

		const handled = button.keydown?.({ type: 'keydown', key: ' ', code: ' ', text: ' ' });

		expect(handled).toBe(true);
		expect(pressed).toHaveBeenCalledOnce();
		expect(clicked).toHaveBeenCalledOnce();
		expect(label.textContent).toBe('Save');
	});
});
