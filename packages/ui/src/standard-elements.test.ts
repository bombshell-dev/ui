import { describe, expect, test } from 'vitest';
import { createHost, HostApi } from './host.ts';
import { installStandardElements } from './standard-elements.ts';
import { Dialog } from './components/dialog.ts';
import { Input } from './elements/input.ts';
import { getFocus } from './focus.ts';

describe('standard elements', () => {
	test('registers primitive dependencies transitively for individual components', () => {
		const host = createHost();
		Input.register(host);
		Dialog.register(host);

		const input = host.createElement('input');
		const dialog = host.createElement('dialog');
		host.element.append(input, dialog);

		const inputBox = input.children[0];
		const panel = dialog.children[0];
		expect(inputBox).toMatchObject({ type: 'element', name: 'box' });
		if (inputBox?.type !== 'element' || panel?.type !== 'element') return;
		expect(inputBox.children[0]).toMatchObject({ type: 'element', name: 'text' });
		const actions = panel.children[3];
		if (actions?.type !== 'element') return;
		expect(actions.children.map((child) => child.type === 'element' && child.name)).toEqual([
			'button',
			'button',
		]);
	});

	test('deduplicates dependencies and excludes application components', () => {
		const host = createHost();

		installStandardElements(host);

		expect([...HostApi.at(host.root).definitions.keys()]).toEqual([
			'box',
			'text',
			'button',
			'input',
			'div',
			'span',
			'label',
			'legend',
			'form',
			'fieldset',
			'textarea',
			'nav',
			'p',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'ul',
			'ol',
			'li',
			'a',
			'img',
			'table',
			'thead',
			'tbody',
			'tfoot',
			'tr',
			'th',
			'td',
		]);
	});

	test('installs focus cleanup with the built-in interactive controls', () => {
		const host = createHost();
		installStandardElements(host);
		const input = host.createElement('input');
		const button = host.createElement('button', { label: 'Next' });
		host.element.append(input, button);
		expect(getFocus(host.root)).toBe(input.node);

		host.removeChild(host.element, input);

		expect(getFocus(host.root)).toBe(button.node);
	});
});
