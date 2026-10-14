import { describe, expect, test, vi } from 'vitest';
import { createHost } from '../host.ts';
import { installStandardElements } from '../standard-elements.ts';
import { rgba } from '../values.ts';
import type { HostElement } from '../elements.ts';
import { FocusApi, getFocus, setFocus } from '../focus.ts';
import { TextArea } from './html.ts';
import { Button } from './button.ts';

describe('browser-like host elements', () => {
	test('textarea guards disabled editing and updates focus eligibility like other controls', () => {
		const host = createHost();
		TextArea.register(host);
		Button.register(host);
		const textarea = host.createElement('textarea', { disabled: true, defaultValue: 'initial' });
		const button = host.createElement('button', { label: 'Next' });
		const input = vi.fn();
		textarea.addEventListener('input', input);
		host.element.append(textarea, button);
		const text = textarea.childrenContainer!;
		expect(getFocus(host.root)).toBe(button.node);
		expect(FocusApi.at(host.root).canFocus(textarea.node!)).toBe(false);
		expect(textarea.keydown?.({ type: 'keydown', key: 'x', code: 'x', text: 'x' })).toBe(false);
		expect(textarea.keyrepeat?.({ type: 'keyrepeat', key: 'Enter', code: 'Enter' })).toBe(false);
		expect(textarea.properties.value).toBe('initial');
		expect(input).not.toHaveBeenCalled();
		textarea.setProperty('disabled', false);
		expect(FocusApi.at(host.root).canFocus(textarea.node!)).toBe(true);
		setFocus(textarea.node!);
		expect(text.properties.caret).toBe(7);
		expect(textarea.keydown?.({ type: 'keydown', key: 'ArrowLeft', code: 'ArrowLeft' })).toBe(true);
		expect(text.properties.caret).toBe(6);
		expect(input).not.toHaveBeenCalled();
		textarea.keydown?.({ type: 'keydown', key: 'x', code: 'x', text: 'x' });
		expect(textarea.properties.value).toBe('initiaxl');
		expect(input).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ value: 'initiaxl' }));
		textarea.setProperty('disabled', true);
		expect(getFocus(host.root)).not.toBe(textarea.node);
		expect(text.properties).not.toHaveProperty('caret');
		textarea.setProperty('value', 'controlled');
		expect(textarea.textContent).toBe('controlled');
	});

	test('textarea clears its caret on disconnect and preserves editing state on reconnect', () => {
		const host = createHost();
		TextArea.register(host);
		const textarea = host.createElement('textarea', { defaultValue: 'initial' });
		host.element.append(textarea);
		const implementation = textarea.children[0];
		const text = textarea.childrenContainer!;
		textarea.keydown?.({ type: 'keydown', key: 'Home', code: 'Home' });
		expect(text.properties.caret).toBe(0);
		host.removeChild(host.element, textarea);
		expect(getFocus(host.root)).toBe(host.root);
		expect(text.properties).not.toHaveProperty('caret');
		expect(textarea.keydown?.({ type: 'keydown', key: 'x', code: 'x', text: 'x' })).toBe(false);
		host.element.append(textarea);
		expect(getFocus(host.root)).toBe(textarea.node);
		expect(textarea.children).toEqual([implementation]);
		expect(textarea.childrenContainer).toBe(text);
		expect(text.properties.caret).toBe(0);
		expect(textarea.textContent).toBe('initial');
	});

	test.each(['div', 'span', 'ul', 'li', 'a', 'table', 'tr', 'td', 'button'])(
		'%s keeps its implementation and projected content across reconnects',
		(name) => {
			const host = createHost();
			installStandardElements(host);
			const child = host.createElement('text', {}, 'middle');
			const element = host.createElement(name, 'before ', child, ' after');
			host.element.append(element);
			const implementation = element.children[0];
			const container = element.childrenContainer!;
			host.removeChild(host.element, element);
			element.append(' detached');
			host.element.append(element);
			expect(element.children).toEqual([implementation]);
			expect(element.childrenContainer).toBe(container);
			expect(container.children).toContain(child);
			expect(container.childNodes.filter((node) => node === child)).toHaveLength(1);
			expect(element.textContent).toBe('before middle after detached');
		},
	);

	test('textarea consumes initial text without duplicating it and edits code points', () => {
		const host = createHost();
		installStandardElements(host);
		const textarea = host.createElement('textarea', 'a\u{1f984}\nb');
		host.element.append(textarea);
		const implementation = textarea.children[0];
		const container = textarea.childrenContainer!;
		expect(textarea.children).toHaveLength(1);
		textarea.keydown?.({ type: 'keydown', key: 'Home', code: 'Home' });
		textarea.keyrepeat?.({ type: 'keyrepeat', key: 'Backspace', code: 'Backspace' });
		textarea.keydown?.({ type: 'keydown', key: 'ArrowLeft', code: 'ArrowLeft' });
		textarea.keydown?.({ type: 'keydown', key: 'Delete', code: 'Delete' });
		expect(textarea.properties.value).toBe('ab');
		host.removeChild(host.element, textarea);
		host.element.append(textarea);
		expect(textarea.children).toEqual([implementation]);
		expect(textarea.childrenContainer).toBe(container);
		expect(textarea.textContent).toBe('ab');
		textarea.setProperty('value', 'replacement');
		expect(textarea.textContent).toBe('replacement');
	});

	test.each(['div', 'form', 'fieldset', 'ul', 'table', 'tr', 'thead'])(
		'%s forwards only selected box properties and their updates',
		(name) => {
			const host = createHost();
			installStandardElements(host);
			const onclick = vi.fn();
			const element = host.createElement(
				name,
				{ id: 'consumer', bg: rgba(1, 2, 3), layout: { gap: 2 }, onclick, caption: 'semantic' },
				'content',
			);
			host.element.append(element);
			const container = element.childrenContainer!;
			expect(container.properties.bg).toBe(rgba(1, 2, 3));
			expect(container.properties.layout).toMatchObject({ gap: 2 });
			expect(container.properties).not.toHaveProperty('id');
			expect(container.properties).not.toHaveProperty('onclick');
			expect(container.properties).not.toHaveProperty('caption');
			element.setProperty('bg', rgba(4, 5, 6));
			element.setProperty('layout', { gap: 4 });
			expect(container.properties.bg).toBe(rgba(4, 5, 6));
			expect(container.properties.layout).toMatchObject({ gap: 4 });
			element.setProperty('bg', undefined);
			element.setProperty('layout', undefined);
			expect(container.properties).not.toHaveProperty('bg');
			expect(container.properties.layout).toMatchObject({
				direction: name === 'tr' ? 'ltr' : 'ttb',
			});
			expect(element.childrenContainer).toBe(container);
		},
	);

	test.each(['span', 'label', 'legend', 'a'])(
		'%s forwards selected text properties without identity or events',
		(name) => {
			const host = createHost();
			installStandardElements(host);
			const element = host.createElement(
				name,
				{ color: rgba(1, 2, 3), wrap: 20, id: 'consumer', onclick: vi.fn(), href: '/docs' },
				'content',
			);
			host.element.append(element);
			const container = element.childrenContainer!;
			expect(container.properties).toMatchObject({ color: rgba(1, 2, 3), wrap: 20 });
			for (const property of ['id', 'onclick', 'href'])
				expect(container.properties).not.toHaveProperty(property);
			element.setProperty('color', rgba(4, 5, 6));
			element.setProperty('wrap', undefined);
			expect(container.properties.color).toBe(rgba(4, 5, 6));
			expect(container.properties).not.toHaveProperty('wrap');
			expect(element.childrenContainer).toBe(container);
		},
	);

	test.each(['div', 'span', 'p', 'li', 'a', 'td'])(
		'%s preserves literal children around nested elements',
		(name) => {
			const host = createHost();
			installStandardElements(host);
			const nested = host.createElement('text', {}, 'middle');
			const element = host.createElement(name, 'before ', nested, ' after');
			host.element.append(element);

			expect(element.textContent).toBe('before middle after');
			expect(element.childrenContainer?.childNodes).toMatchObject([
				{ type: 'literal', content: 'before ' },
				{ type: 'element', name: 'text' },
				{ type: 'literal', content: ' after' },
			]);
		},
	);

	test('textarea initializes from literal child nodes', () => {
		const host = createHost();
		installStandardElements(host);
		const textarea = host.createElement('textarea', 'first\nsecond');
		host.element.append(textarea);

		expect(textarea.properties.value).toBe('first\nsecond');
		expect(textarea.textContent).toBe('first\nsecond');
	});

	test('registers structural and text wrappers', () => {
		const host = createHost();
		installStandardElements(host);
		const label = host.createElement('label', 'Name');
		const form = host.createElement('form', host.createElement('fieldset', 'Fields'));
		host.element.append(label, form);

		expect(label.children[0]).toMatchObject({ type: 'element', name: 'text' });
		expect(form.children[0]).toMatchObject({ type: 'element', name: 'box' });
		if (form.children[0]?.type !== 'element') return;
		expect(form.children[0].children[0]).toMatchObject({ type: 'element', name: 'fieldset' });
		if (form.children[0].children[0]?.type !== 'element') return;
		expect(form.children[0].children[0].children[0]).toMatchObject({
			type: 'element',
			name: 'box',
		});
	});

	test('textarea edits multiline text and emits input values', () => {
		const host = createHost();
		installStandardElements(host);
		const textarea = host.createElement('textarea', { defaultValue: 'Hi' });
		const oninput = vi.fn();
		textarea.addEventListener('input', oninput);
		host.element.append(textarea);

		textarea.keydown?.({ type: 'keydown', key: 'Enter', code: 'Enter' });
		textarea.keydown?.({ type: 'keydown', key: 'x', code: 'x', text: 'x' });

		expect(textarea.textContent).toBe('Hi\nx');
		expect(textarea.properties.value).toBe('Hi\nx');
		expect(oninput).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'Hi\nx' }));
	});

	test('lists render nested markers and list items', () => {
		const host = createHost();
		installStandardElements(host);
		const list = host.createElement(
			'ol',
			{ start: 3 },
			host.createElement('li', 'First'),
			host.createElement('li', 'Second'),
		);
		host.element.append(list);

		expect(findElements(list, 'li')).toHaveLength(2);
		expect(findElements(list, 'text').map((element) => element.textContent)).toEqual(['3.', '4.']);
		expect(list.textContent).toBe('FirstSecond');
	});

	test('links emit a navigation request and images display their alt fallback', () => {
		const host = createHost();
		installStandardElements(host);
		const onNavigate = vi.fn();
		const link = host.createElement('a', { href: '/docs', onnavigate: onNavigate }, 'Docs');
		const image = host.createElement('img', { src: '/diagram.png', alt: 'Diagram' });
		host.element.append(link, image);

		expect(link.node).not.toBeNull();
		link.emit({ type: 'click' });

		expect(onNavigate).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'navigate', href: '/docs' }),
		);
		expect(image.textContent).toBe('[Diagram]');
	});

	test('navigation and heading elements retain block structure', () => {
		const host = createHost();
		installStandardElements(host);
		const nav = host.createElement(
			'nav',
			host.createElement('h2', 'Sections'),
			host.createElement('p', 'Choose a section'),
		);
		host.element.append(nav);

		expect(findElements(nav, 'h2')).toHaveLength(1);
		expect(findElements(nav, 'p')).toHaveLength(1);
		expect(nav.textContent).toBe('SectionsChoose a section');
	});

	test('table cells in each column share the widest content width', () => {
		const host = createHost();
		installStandardElements(host);
		const table = host.createElement(
			'table',
			host.createElement(
				'thead',
				host.createElement(
					'tr',
					host.createElement('th', 'Name'),
					host.createElement('th', 'Value'),
				),
			),
			host.createElement(
				'tbody',
				host.createElement(
					'tr',
					host.createElement('td', 'Alexandra'),
					host.createElement('td', '10'),
				),
			),
		);
		host.element.append(table);
		const cells = [...findElements(table, 'th'), ...findElements(table, 'td')];
		const widths = cells.map((cell) => {
			const box = cell.children.find((child) => child.type === 'element');
			return box?.type === 'element'
				? (box.properties.layout as { width?: { value?: number } }).width?.value
				: undefined;
		});

		expect(findElements(table, 'tr')).toHaveLength(2);
		expect(widths).toEqual([11, 7, 11, 7]);
		expect(table.textContent).toBe('NameValueAlexandra10');
	});
});

function findElements(root: HostElement, name: string): HostElement[] {
	const matches: HostElement[] = [];
	if (root.name === name) matches.push(root);
	for (const child of root.children) {
		if (child.type === 'element') matches.push(...findElements(child, name));
	}
	return matches;
}
