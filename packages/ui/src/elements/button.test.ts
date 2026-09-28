import { describe, expect, test } from 'vitest';
import { installBuiltins } from '../builtins.ts';
import { createHost } from '../host.ts';

describe('button', () => {
	test('composes its label from persistent box and text children', () => {
		const host = createHost();
		installBuiltins(host);
		const button = host.createElement('button', { label: 'Save' });
		host.element.append(button);

		const box = button.children[0];
		expect(box).toMatchObject({ type: 'element', name: 'box' });
		if (box.type !== 'element') return;
		expect(box.properties.border).toMatchObject({ top: 1, right: 1, bottom: 1, left: 1 });
		expect(box.properties.layout).toMatchObject({ padding: { left: 2, right: 2 } });
		const label = box.children[0];
		expect(label).toMatchObject({ type: 'element', name: 'text' });
		if (label.type !== 'element') return;

		button.setProperty('label', 'Submit');

		expect(button.children[0]).toBe(box);
		expect(box.children[0]).toBe(label);
		expect(label.textContent).toBe('Submit');
	});
});
