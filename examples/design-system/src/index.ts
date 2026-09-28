import { stdin, stdout } from 'node:process';
import { fixed, grow } from '@bomb.sh/tty';
import { type BoxProps, createUI, type HostElement, rgba, type TextProps } from '@clack/ui';

const colors = {
	accent: rgba(0, 205, 205),
	border: rgba(0, 0, 238),
	danger: rgba(205, 0, 0),
	muted: rgba(127, 127, 127),
	success: rgba(0, 205, 0),
	white: rgba(255, 255, 255),
};

await using ui = await createUI({
	height: 40,
	inline: true,
	input: stdin,
	output: stdout,
});

const { host } = ui;

const nameInput = host.createElement('input');
const emailInput = host.createElement('input');
const saveButton = host.createElement('button', { label: 'Save changes' });
const disabledButton = host.createElement('button', { disabled: true, label: 'Disabled' });
const status = text('Ready. Tab between controls and press Enter on a button.', {
	color: colors.muted,
});

host.addEventListener(nameInput, 'input', (event) => {
	status.textContent = `Name changed to ${event.value || '(empty)'}`;
});
host.addEventListener(emailInput, 'input', (event) => {
	status.textContent = `Email changed to ${event.value || '(empty)'}`;
});
host.addEventListener(saveButton, 'press', () => {
	status.textContent = `Saved ${nameInput.properties.value || 'profile'} successfully.`;
	status.setProperty('color', colors.success);
});

const dialog = host.createElement(
	'dialog',
	{
		title: 'Discard draft?',
		message: 'This action cannot be undone.',
		confirmLabel: 'Discard',
		cancelLabel: 'Keep editing',
	},
	host.createElement('text', { color: colors.muted }, 'The current form is only a preview.'),
);
host.addEventListener(dialog, 'confirm', () => {
	status.textContent = 'Draft discarded.';
	status.setProperty('color', colors.danger);
});
host.addEventListener(dialog, 'cancel', () => {
	status.textContent = 'Keep editing selected.';
	status.setProperty('color', colors.accent);
});

const app = box(
	{
		layout: {
			direction: 'ttb',
			gap: 1,
			padding: { top: 1, bottom: 1, left: 2, right: 2 },
			width: fixed(76),
		},
		border: { color: colors.border, top: 1, right: 1, bottom: 1, left: 1 },
	},
	box(
		{ layout: { direction: 'ttb' } },
		text('CLACK / DESIGN SYSTEM', { color: colors.accent }),
		text('A compositional terminal UI kit', { color: colors.white }),
	),
	box(
		{
			layout: {
				direction: 'ttb',
				gap: 1,
				width: grow(),
				padding: { top: 1, bottom: 1, left: 2, right: 2 },
			},
			border: { color: colors.muted, top: 1, right: 1, bottom: 1, left: 1 },
		},
		text('Form controls', { color: colors.accent }),
		field('Name', nameInput),
		field('Email', emailInput),
		box({ layout: { direction: 'ltr', gap: 1 } }, saveButton, disabledButton),
	),
	box(
		{
			layout: { direction: 'ttb', gap: 1, padding: { top: 1, bottom: 1, left: 2, right: 2 } },
			border: { color: colors.muted, top: 1, right: 1, bottom: 1, left: 1 },
		},
		text('Dialog component', { color: colors.accent }),
		dialog,
	),
	status,
);

host.insertBefore(host.element, app);
await ui.main();

function box(properties: Omit<BoxProps, 'key'>, ...children: HostElement[]): HostElement {
	const element = host.createElement('box');
	setProperties(element, properties);
	for (const child of children) {
		host.insertBefore(element, child);
	}
	return element;
}

function field(label: string, input: HostElement): HostElement {
	return box(
		{ layout: { direction: 'ltr', gap: 1, width: grow() } },
		text(label.padEnd(7), { color: colors.muted }),
		input,
	);
}

function text(content: string, properties: TextProps = {}): HostElement {
	return host.createElement('text', properties, content);
}

function setProperties(element: HostElement, properties: object): void {
	for (const [name, value] of Object.entries(properties)) {
		host.setProperty(element, name, value);
	}
}
