import { describe, expect, test } from 'vitest';
import { createHost, HostApi } from './host.ts';
import { BrowserFacade, installBrowserFacade, installBrowserCompat } from './browser.ts';
import {
	BrowserFacade as RootBrowserFacade,
	installBrowserFacade as installRootBrowserFacade,
} from './index.ts';
import { installStandardElements } from './standard-elements.ts';
import { Input } from './elements/input.ts';
import { Div } from './elements/html.ts';
import { Dialog } from './components/dialog.ts';
import {
	ComponentElement,
	PrimitiveElement,
	defineComponent,
	definePrimitive,
	type CreateResult,
} from './component.ts';
import { layout, LayoutApi } from './layout.ts';
import { text, type Op } from '@bomb.sh/tty';

describe('explicit installation profiles', () => {
	test('root and browser entry points expose the same ordinary facade and installer', () => {
		expect(RootBrowserFacade).toBe(BrowserFacade);
		expect(installRootBrowserFacade).toBe(installBrowserFacade);
		const host = createHost();
		expect(installRootBrowserFacade(host)).toBe(installBrowserFacade(host));
	});

	test('a bare Host has no definitions or browser facade', () => {
		const host = createHost();
		expect([...HostApi.at(host.root).definitions]).toEqual([]);
		expect(host).not.toHaveProperty('document');
		expect(host.element).not.toHaveProperty('ownerDocument');
		expect(host.element).not.toHaveProperty('style');
	});

	test('custom primitives and composed content render without any standard elements', () => {
		class MessageElement extends PrimitiveElement {
			override layout(): Op[] {
				return [text(this.element.textContent)];
			}
		}
		const Message = definePrimitive('custom-message', MessageElement);
		class PanelElement extends ComponentElement {
			override create(): CreateResult {
				const content = Message.create(this.host);
				return { implementation: content, contentContainer: content };
			}
		}
		const Panel = defineComponent('custom-panel', {
			define: PanelElement,
			dependencies: [Message],
		});
		const host = createHost();
		LayoutApi.init(host.root);
		Panel.register(host);
		const panel = Panel.create(host, {}, 'Independent');
		host.element.append(panel);
		expect([...HostApi.at(host.root).definitions.keys()]).toEqual([
			'custom-message',
			'custom-panel',
		]);
		expect([...layout(host.root)]).toEqual([text('Independent')]);
		expect(panel).not.toHaveProperty('ownerDocument');
	});

	test('standard elements do not require browser globals or a facade', () => {
		const host = createHost();
		const before = Reflect.get(globalThis, 'document');
		installStandardElements(host);
		const input = host.createElement('input', { defaultValue: 'seed' });
		host.element.append(input);
		expect(input.properties.value).toBe('seed');
		expect(input).not.toHaveProperty('ownerDocument');
		expect(Reflect.get(globalThis, 'document')).toBe(before);
		expect(HostApi.at(host.root).definitions.has('dialog')).toBe(false);
	});

	test('subsets install only their declared dependency closure', () => {
		const host = createHost();
		installStandardElements(host, [Input]);
		expect([...HostApi.at(host.root).definitions.keys()]).toEqual(['box', 'text', 'input']);
	});

	test('empty standard profiles install nothing', () => {
		const host = createHost();
		installStandardElements(host, []);
		expect([...HostApi.at(host.root).definitions]).toEqual([]);
	});

	test('components register independently and do not require a browser profile', () => {
		const host = createHost();
		Dialog.register(host);
		expect([...HostApi.at(host.root).definitions.keys()]).toEqual([
			'box',
			'text',
			'button',
			'dialog',
		]);
		const dialog = Dialog.create(host, { title: 'Standalone' }, 'Body');
		host.element.append(dialog);
		expect(dialog.textContent).toBe('Body');
		expect(dialog).not.toHaveProperty('ownerDocument');
	});

	test('local browser profiles can omit standard elements and globals', () => {
		const host = createHost();
		const before = Reflect.get(globalThis, 'document');
		const restore = installBrowserCompat(host, { elements: [], globals: false });
		try {
			expect([...HostApi.at(host.root).definitions]).toEqual([]);
			const browser = installBrowserFacade(host);
			expect(browser).toBeInstanceOf(BrowserFacade);
			expect(browser.document.body).toBe(host.element);
			expect(Reflect.get(globalThis, 'document')).toBe(before);
		} finally {
			restore();
		}
	});

	test('browser presets support selected elements and balanced global acquisition', () => {
		const host = createHost();
		const before = Reflect.get(globalThis, 'document');
		const first = installBrowserCompat(host, { elements: [Div] });
		const second = installBrowserCompat(host, { elements: [] });
		try {
			expect([...HostApi.at(host.root).definitions.keys()]).toEqual(['box', 'div']);
			first();
			expect(Reflect.get(globalThis, 'document')).toBe(installBrowserFacade(host).document);
		} finally {
			first();
			second();
		}
		expect(Reflect.get(globalThis, 'document')).toBe(before);
	});

	test('the full browser preset excludes application components', () => {
		const host = createHost();
		const restore = installBrowserCompat(host);
		try {
			expect(HostApi.at(host.root).definitions.has('input')).toBe(true);
			expect(HostApi.at(host.root).definitions.has('table')).toBe(true);
			expect(HostApi.at(host.root).definitions.has('dialog')).toBe(false);
		} finally {
			restore();
		}
	});
});
