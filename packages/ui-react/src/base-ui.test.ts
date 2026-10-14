import { createElement, type ReactNode, useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
	createHost,
	emit,
	installBrowserCompat,
	type HostElement,
	type BrowserElement,
} from '@clack/ui';
import { createRoot } from './root.ts';

// Base UI caches browser detection at import time, before any per-test setup runs.
const restoreBootstrapGlobals = installBrowserCompat(createHost());
const {
	Accordion,
	AlertDialog,
	Autocomplete,
	Avatar,
	Button: BaseButton,
	Checkbox,
	CheckboxGroup,
	Collapsible,
	Combobox,
	ContextMenu,
	CSPProvider: CSPProviderComponent,
	Dialog,
	DirectionProvider: DirectionProviderComponent,
	Drawer,
	Field,
	Fieldset,
	Form,
	Input: BaseInput,
	Menu,
	Menubar,
	Meter,
	NavigationMenu,
	NumberField,
	OTPField,
	Popover,
	PreviewCard,
	Progress,
	Radio,
	RadioGroup,
	ScrollArea,
	Select,
	Separator,
	Switch,
	Tabs,
	Toast,
	Toggle,
	ToggleGroup,
	Toolbar,
	Tooltip,
} = await import('@base-ui/react').finally(restoreBootstrapGlobals);

type Probe = { name: string; tree: ReactNode; expectedError?: RegExp };
type ProbeRow = readonly [name: string, tree: ReactNode, expectedError?: RegExp];
const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
	for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

const probes: Probe[] = (
	[
		['button', createElement(BaseButton, null, 'Action')],
		['separator', createElement(Separator)],
		[
			'avatar',
			createElement(
				Avatar.Root,
				null,
				createElement(Avatar.Image, { src: '/avatar.png' }),
				createElement(Avatar.Fallback, null, 'AB'),
			),
		],
		[
			'progress',
			createElement(
				Progress.Root,
				{ value: 40 },
				createElement(Progress.Track, null, createElement(Progress.Indicator)),
			),
		],
		[
			'meter',
			createElement(
				Meter.Root,
				{ value: 40 },
				createElement(Meter.Track, null, createElement(Meter.Indicator)),
			),
		],
		['toggle', createElement(Toggle, null, 'Bold')],
		[
			'toggle-group',
			createElement(ToggleGroup, null, createElement(Toggle, { value: 'bold' }, 'B')),
		],
		['checkbox', createElement(Checkbox.Root, null, createElement(Checkbox.Indicator))],
		[
			'checkbox-group',
			createElement(
				CheckboxGroup,
				null,
				createElement(Checkbox.Root, { value: 'one' }, createElement(Checkbox.Indicator)),
			),
		],
		[
			'radio-group',
			createElement(
				RadioGroup,
				null,
				createElement(Radio.Root, { value: 'one' }, createElement(Radio.Indicator)),
				createElement(Radio.Root, { value: 'two' }, createElement(Radio.Indicator)),
			),
		],
		['switch', createElement(Switch.Root, null, createElement(Switch.Thumb))],
		[
			'collapsible',
			createElement(
				Collapsible.Root,
				{ defaultOpen: true },
				createElement(Collapsible.Trigger, null, 'Details'),
				createElement(Collapsible.Panel, null, 'Contents'),
			),
		],
		[
			'accordion',
			createElement(
				Accordion.Root,
				{ defaultValue: ['one'] },
				createElement(
					Accordion.Item,
					{ value: 'one' },
					createElement(Accordion.Header, null, createElement(Accordion.Trigger, null, 'One')),
					createElement(Accordion.Panel, null, 'Contents'),
				),
			),
		],
		[
			'tabs',
			createElement(
				Tabs.Root,
				{ defaultValue: 'one' },
				createElement(Tabs.List, null, createElement(Tabs.Tab, { value: 'one' }, 'One')),
				createElement(Tabs.Panel, { value: 'one' }, 'Panel'),
			),
		],
		['direction-provider', createElement(DirectionProviderComponent, { direction: 'ltr' }, 'Text')],
		[
			'semantic-list',
			createElement(
				'nav',
				null,
				createElement(
					'ol',
					{ start: 2 },
					createElement('li', null, 'First'),
					createElement('li', null, 'Second'),
				),
			),
		],
		[
			'semantic-table',
			createElement(
				'table',
				null,
				createElement(
					'thead',
					null,
					createElement(
						'tr',
						null,
						createElement('th', null, 'Name'),
						createElement('th', null, 'Value'),
					),
				),
				createElement(
					'tbody',
					null,
					createElement(
						'tr',
						null,
						createElement('td', null, 'Item'),
						createElement('td', null, '10'),
					),
				),
			),
		],
		['csp-provider', createElement(CSPProviderComponent, { nonce: 'probe' }, 'Text')],
		['input', createElement(BaseInput, { 'aria-label': 'Name' })],
		[
			'field',
			createElement(
				Field.Root,
				null,
				createElement(Field.Label, null, 'Name'),
				createElement(Field.Control),
				createElement(Field.Description, null, 'Your name'),
			),
		],
		[
			'fieldset',
			createElement(
				Fieldset.Root,
				null,
				createElement(Fieldset.Legend, null, 'Details'),
				createElement(BaseInput, { name: 'name' }),
			),
		],
		['form', createElement(Form, null, createElement(BaseInput, { name: 'name' }))],
		[
			'number-field',
			createElement(
				NumberField.Root,
				null,
				createElement(
					NumberField.Group,
					null,
					createElement(NumberField.Decrement),
					createElement(NumberField.Input),
					createElement(NumberField.Increment),
				),
			),
		],
		['otp-field', createElement(OTPField.Root, { length: 4 }, createElement(OTPField.Input))],
		[
			'select-closed',
			createElement(
				Select.Root,
				null,
				createElement(Select.Trigger, null, createElement(Select.Value)),
				createElement(
					Select.Portal,
					null,
					createElement(
						Select.Positioner,
						null,
						createElement(
							Select.Popup,
							null,
							createElement(Select.List, null, createElement(Select.Item, { value: 'one' }, 'One')),
						),
					),
				),
			),
		],
		[
			'combobox-closed',
			createElement(
				Combobox.Root,
				null,
				createElement(Combobox.Input),
				createElement(Combobox.Trigger),
				createElement(
					Combobox.Portal,
					null,
					createElement(
						Combobox.Positioner,
						null,
						createElement(
							Combobox.Popup,
							null,
							createElement(
								Combobox.List,
								null,
								createElement(Combobox.Item, { value: 'one' }, 'One'),
							),
						),
					),
				),
			),
		],
		[
			'autocomplete-closed',
			createElement(
				Autocomplete.Root,
				null,
				createElement(Autocomplete.Input),
				createElement(
					Autocomplete.Portal,
					null,
					createElement(
						Autocomplete.Positioner,
						null,
						createElement(
							Autocomplete.Popup,
							null,
							createElement(
								Autocomplete.List,
								null,
								createElement(Autocomplete.Item, { value: 'one' }, 'One'),
							),
						),
					),
				),
			),
		],
		[
			'dialog-open',
			createElement(
				Dialog.Root,
				{ open: true },
				createElement(Dialog.Trigger, null, 'Open'),
				createElement(
					Dialog.Portal,
					{ container: { current: null }, keepMounted: true },
					createElement(Dialog.Popup, null, createElement(Dialog.Title, null, 'Title')),
				),
			),
		],
		[
			'alert-dialog-open',
			createElement(
				AlertDialog.Root,
				{ open: true },
				createElement(AlertDialog.Trigger, null, 'Delete'),
				createElement(
					AlertDialog.Portal,
					{ container: { current: null }, keepMounted: true },
					createElement(AlertDialog.Popup, null, createElement(AlertDialog.Title, null, 'Confirm')),
				),
			),
		],
		[
			'drawer-open',
			createElement(
				Drawer.Root,
				{ open: true },
				createElement(Drawer.Trigger, null, 'Open'),
				createElement(
					Drawer.Portal,
					{ container: { current: null }, keepMounted: true },
					createElement(Drawer.Viewport, null, createElement(Drawer.Popup, null, 'Drawer')),
				),
			),
		],
		[
			'popover-open',
			createElement(
				Popover.Root,
				{ open: true },
				createElement(Popover.Trigger, null, 'Open'),
				createElement(
					Popover.Portal,
					{ container: { current: null } },
					createElement(Popover.Positioner, null, createElement(Popover.Popup, null, 'Popover')),
				),
			),
		],
		[
			'tooltip-open',
			createElement(
				Tooltip.Provider,
				null,
				createElement(
					Tooltip.Root,
					{ open: true },
					createElement(Tooltip.Trigger, null, 'Hover'),
					createElement(
						Tooltip.Portal,
						{ container: { current: null } },
						createElement(Tooltip.Positioner, null, createElement(Tooltip.Popup, null, 'Tip')),
					),
				),
			),
		],
		[
			'preview-card-open',
			createElement(
				PreviewCard.Root,
				{ open: true },
				createElement(PreviewCard.Trigger, null, 'Link'),
				createElement(
					PreviewCard.Portal,
					{ container: { current: null } },
					createElement(
						PreviewCard.Positioner,
						null,
						createElement(PreviewCard.Popup, null, 'Preview'),
					),
				),
			),
		],
		[
			'menu-open',
			createElement(
				Menu.Root,
				{ open: true },
				createElement(Menu.Trigger, null, 'Menu'),
				createElement(
					Menu.Portal,
					{ container: { current: null } },
					createElement(
						Menu.Positioner,
						null,
						createElement(Menu.Popup, null, createElement(Menu.Item, null, 'One')),
					),
				),
			),
		],
		[
			'context-menu',
			createElement(
				ContextMenu.Root,
				null,
				createElement(ContextMenu.Trigger, null, 'Context'),
				createElement(
					ContextMenu.Portal,
					{ container: { current: null } },
					createElement(
						ContextMenu.Positioner,
						null,
						createElement(ContextMenu.Popup, null, createElement(ContextMenu.Item, null, 'One')),
					),
				),
			),
		],
		[
			'menubar',
			createElement(
				Menubar,
				null,
				createElement(
					Menu.Root,
					{ open: true },
					createElement(Menu.Trigger, null, 'File'),
					createElement(
						Menu.Portal,
						{ container: { current: null } },
						createElement(Menu.Positioner, null, createElement(Menu.Popup, null, 'Open')),
					),
				),
			),
		],
		[
			'navigation-menu',
			createElement(
				NavigationMenu.Root,
				null,
				createElement(
					NavigationMenu.List,
					null,
					createElement(
						NavigationMenu.Item,
						null,
						createElement(NavigationMenu.Trigger, null, 'Products'),
						createElement(NavigationMenu.Content, null, 'Links'),
					),
				),
			),
		],
		[
			'scroll-area',
			createElement(
				ScrollArea.Root,
				null,
				createElement(
					ScrollArea.Viewport,
					null,
					createElement(ScrollArea.Content, null, 'Scrollable text'),
				),
				createElement(ScrollArea.Scrollbar, null, createElement(ScrollArea.Thumb)),
			),
		],
		['toast', createElement(Toast.Provider, null, createElement(Toast.Viewport))],
		[
			'toolbar',
			createElement(
				Toolbar.Root,
				null,
				createElement(Toolbar.Button, null, 'Bold'),
				createElement(Toolbar.Separator),
				createElement(Toolbar.Link, { href: '/' }, 'Home'),
			),
		],
	] as ProbeRow[]
).map(([name, tree, expectedError]) => ({ name, tree, expectedError }));

describe('Base UI integration smoke matrix', () => {
	test.each(probes)(
		'$name mounts or reports its browser dependency',
		async ({ name, tree, expectedError }) => {
			const { host, root, errors } = setup();

			expect(() => root.render(tree)).not.toThrow();
			if (expectedError) {
				expect(errors).toHaveLength(1);
				expect(String(errors[0])).toMatch(expectedError);
			} else {
				expect(
					errors,
					`${name} reported: ${errors.map((error) => (error instanceof Error ? error.stack : String(error))).join('\n')}`,
				).toEqual([]);
				await vi.waitFor(() => expect(host.element.childNodes.length).toBeGreaterThan(0));
			}
		},
	);

	test('Base UI Toggle responds to a Host click and updates React state', async () => {
		function Probe(): ReactNode {
			const [pressed, setPressed] = useState(false);
			return createElement(
				Toggle,
				{ pressed, onPressedChange: setPressed },
				pressed ? 'On' : 'Off',
			);
		}
		const { host, root } = setup();
		root.render(createElement(Probe));
		const button = findElement(host.element, 'button');
		if (!button?.node) throw new Error('Base UI Toggle did not render a button');

		emit(button, { type: 'click' });

		await vi.waitFor(() => expect(button.textContent).toContain('On'));
	});

	test('Base UI Input value is writable through the Host property bridge', () => {
		const { host, root } = setup();
		root.render(createElement(BaseInput, { defaultValue: 'seed' }));
		const input = findElement(host.element, 'input');

		expect(input?.properties.value).toBe('seed');
		expect(input?.textContent).toBe('seed');
	});

	test('Base UI Checkbox activation forwards to the Host change event', () => {
		const onCheckedChange = vi.fn();
		const { host, root } = setup();
		root.render(
			createElement(Checkbox.Root, { onCheckedChange }, createElement(Checkbox.Indicator)),
		);
		const control = findElement(host.element, 'span');
		if (!control?.node) throw new Error('Base UI Checkbox did not render a span control');

		emit(control, { type: 'click' });
		expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
	});

	test('Base UI Dialog portal mounts popup content and removes it on unmount', async () => {
		const { host, root, errors, browserRoot } = setup();
		root.render(
			createElement(
				Dialog.Root,
				{ open: true },
				createElement(Dialog.Trigger, null, 'Open'),
				createElement(
					Dialog.Portal,
					{ container: browserRoot as unknown as HTMLElement },
					createElement(
						Dialog.Popup,
						null,
						createElement(Dialog.Title, null, 'Dialog portal content'),
						createElement(Dialog.Description, null, 'Portaled into the Host'),
						createElement(Dialog.Close, null, 'Close'),
					),
				),
			),
		);
		await vi.waitFor(() => {
			expect(errors).toEqual([]);
			expect(host.element.textContent).toContain('Dialog portal content');
		});
		const popup = browserRoot.querySelector('[role="dialog"]');
		expect(popup).not.toBeNull();
		expect(popup?.ownerDocument).toBe(browserRoot.ownerDocument);
		expect(popup?.isConnected).toBe(true);

		root.unmount();

		await vi.waitFor(() => {
			expect(errors).toEqual([]);
			expect(browserRoot.querySelector('[role="dialog"]')).toBeNull();
			expect(host.element.textContent).toBe('');
			expect(popup?.isConnected).toBe(false);
		});
	});

	test('Base UI Switch activation forwards to the Host change event', () => {
		const { host, root } = setup();
		const onCheckedChange = vi.fn();
		root.render(createElement(Switch.Root, { onCheckedChange }, createElement(Switch.Thumb)));
		const control = findElement(host.element, 'span');
		if (!control?.node) throw new Error('Base UI Switch did not render a span control');

		emit(control, { type: 'click' });
		expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
	});

	test('Base UI Toast manager displays a notification in the Host tree', async () => {
		const { host, root, errors } = setup();
		const manager = Toast.createToastManager();
		function Notifications(): ReactNode {
			const { toasts } = Toast.useToastManager();
			return toasts.map((toast) =>
				createElement(
					Toast.Root,
					{ key: toast.id, toast },
					createElement(
						Toast.Content,
						null,
						createElement(Toast.Title, null, toast.title),
						createElement(Toast.Description, null, toast.description),
					),
				),
			);
		}
		root.render(
			createElement(
				Toast.Provider,
				{ toastManager: manager, timeout: 0 },
				createElement(Toast.Viewport, null, createElement(Notifications)),
			),
		);
		manager.add({ title: 'Saved', description: 'Changes saved', timeout: 0 });
		await new Promise((resolve) => setTimeout(resolve, 20));

		expect(errors).toEqual([]);
		expect(host.element.textContent).toContain('Saved');
	});
});

function setup(): {
	host: ReturnType<typeof createHost>;
	root: ReturnType<typeof createRoot>;
	errors: unknown[];
	browserRoot: BrowserElement;
} {
	const host = createHost();
	const errors: unknown[] = [];
	const restoreDOMGlobals = installBrowserCompat(host);
	const browserRoot = host.element as BrowserElement;
	const root = createRoot(host.element, { onError: (error) => errors.push(error) });
	cleanups.push(async () => {
		try {
			root.unmount();
		} finally {
			// Floating UI positioning chains can outlive unmount; drain them under this Host's globals.
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			restoreDOMGlobals();
		}
	});
	expect(Reflect.get(globalThis, 'document')).toBe(browserRoot.ownerDocument);
	expect(Reflect.get(globalThis, 'window')).toBe(browserRoot.ownerDocument.defaultView);
	return { host, root, errors, browserRoot };
}

function findElement(root: HostElement, name: string): HostElement | undefined {
	if (root.name === name) return root;
	for (const child of root.children) {
		if (child.type !== 'element') continue;
		const result = findElement(child, name);
		if (result) return result;
	}
	return undefined;
}
