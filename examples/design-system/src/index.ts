import { stdin, stdout } from 'node:process';
import { fixed, grow } from '@bomb.sh/tty';
import {
	Box,
	Button,
	createUI,
	Dialog,
	type HostElement,
	Input,
	registerComponents,
	rgba,
	Text,
	template,
} from '@clack/ui';
import { ClassInput } from './class-model/input.ts';

const colors = {
	accent: rgba(0, 205, 205),
	border: rgba(0, 0, 238),
	danger: rgba(205, 0, 0),
	muted: rgba(127, 127, 127),
	success: rgba(0, 205, 0),
	white: rgba(255, 255, 255),
};

await using ui = await createUI({
	height: 48,
	inline: true,
	input: stdin,
	output: stdout,
});

const { host } = ui;
registerComponents(host, [Box, Text, Input, Button, Dialog, ClassInput]);
const box = template(host, Box);
const text = template(host, Text);

const nameInput = Input.create(host);
const emailInput = Input.create(host);
const comparisonInput = Input.create(host);
const classInput = ClassInput.create(host, { value: 'Class-based input' });
const saveButton = Button.create(host, { label: 'Save changes' });
const disabledButton = Button.create(host, { disabled: true, label: 'Disabled' });
const status = text(
	{ color: colors.muted },
	'Ready. Tab between controls and press Enter on a button.',
);

host.addEventListener(nameInput, 'input', (event) => {
	status.textContent = `Name changed to ${event.value || '(empty)'}`;
});
host.addEventListener(emailInput, 'input', (event) => {
	status.textContent = `Email changed to ${event.value || '(empty)'}`;
});
host.addEventListener(comparisonInput, 'input', (event) => {
	status.textContent = `Built-in Input: ${event.value || '(empty)'}`;
});
host.addEventListener(classInput, 'input', (event) => {
	status.textContent = `Class Input: ${event.value || '(empty)'}`;
});
host.addEventListener(saveButton, 'press', () => {
	status.textContent = `Saved ${nameInput.properties.value || 'profile'} successfully.`;
	status.setProperty('color', colors.success);
});

const dialog = Dialog.create(
	host,
	{
		title: 'Discard draft?',
		message: 'This action cannot be undone.',
		confirmLabel: 'Discard',
		cancelLabel: 'Keep editing',
	},
	text({ color: colors.muted }, 'The current form is only a preview.'),
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
			padding: { left: 1, right: 1 },
			width: fixed(76),
		},
		border: { color: colors.border, top: 1, right: 1, bottom: 1, left: 1 },
	},
	box(
		{ layout: { direction: 'ttb' } },
		text({ color: colors.accent }, 'CLACK / DESIGN SYSTEM'),
		text({ color: colors.white }, 'A compositional terminal UI kit'),
	),
	box(
		{
			layout: {
				direction: 'ttb',
				gap: 1,
				width: grow(),
				padding: { left: 1, right: 1 },
			},
			border: { color: colors.muted, top: 1, right: 1, bottom: 1, left: 1 },
		},
		text({ color: colors.accent }, 'Form controls'),
		field('Name', nameInput),
		field('Email', emailInput),
		box({ layout: { direction: 'ltr', gap: 1 } }, saveButton, disabledButton),
	),
	box(
		{
			layout: {
				direction: 'ttb',
				gap: 1,
				width: grow(),
				padding: { left: 1, right: 1 },
			},
			border: { color: colors.muted, top: 1, right: 1, bottom: 1, left: 1 },
		},
		text({ color: colors.accent }, 'Input implementations'),
		box(
			{ layout: { direction: 'ltr', gap: 2 } },
			box(
				{ layout: { direction: 'ttb', gap: 1, width: grow() } },
				text({ color: colors.muted }, 'Current composed Input'),
				comparisonInput,
			),
			box(
				{ layout: { direction: 'ttb', gap: 1, width: grow() } },
				text({ color: colors.muted }, 'Class/mixin prototype'),
				classInput,
			),
		),
	),
	box(
		{
			layout: { direction: 'ttb', gap: 1, padding: { left: 1, right: 1 } },
			border: { color: colors.muted, top: 1, right: 1, bottom: 1, left: 1 },
		},
		text({ color: colors.accent }, 'Dialog component'),
		dialog,
	),
	status,
);

host.element.append(app);
await ui.main();

function field(label: string, input: HostElement): HostElement {
	return box(
		{ layout: { direction: 'ltr', gap: 1, width: grow() } },
		text({ color: colors.muted }, label.padEnd(7)),
		input,
	);
}
