import { stdin, stdout } from 'node:process';
import { fixed, grow, percent } from '@bomb.sh/tty';
import {
	Box,
	type BoxProps,
	createUI,
	type HostElement,
	Input,
	registerComponents,
	rgba,
	Text,
	type TextProps,
} from '@clack/ui';

const blue = rgba(0, 0, 238);
const cyan = rgba(0, 205, 205);
const gray = rgba(127, 127, 127);

await using ui = await createUI({ input: stdin, output: stdout });
const { host } = ui;
registerComponents(host, [Box, Text, Input]);

const sayInput = host.createElement('input');
const toInput = host.createElement('input');

const say = host.createLiteral('Hello');
const comma = host.createLiteral(', ');
const to = host.createLiteral('World');
const bang = host.createLiteral('!');

const output = host.createElement('text');

host.setProperty(output, 'color', cyan);
host.insertBefore(output, say);
host.insertBefore(output, comma);
host.insertBefore(output, to);
host.insertBefore(output, bang);

host.addEventListener(sayInput, 'input', (event) => {
	host.setText(say, event.value);
});
host.addEventListener(toInput, 'input', (event) => {
	host.setText(to, event.value);
});

const app = box(
	{
		layout: {
			direction: 'ttb',
			gap: 1,
			padding: { left: 1, right: 1 },
			width: fixed(40),
		},
		border: { color: blue, top: 1, right: 1, bottom: 1, left: 1 },
	},
	output,
	box(
		{ layout: { direction: 'ttb', width: grow() } },
		box({ layout: { direction: 'ltr', gap: 1, width: grow() } }, label('say:'), label('to:')),
		box({ layout: { direction: 'ltr', gap: 1, width: grow() } }, sayInput, toInput),
	),
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

function label(content: string): HostElement {
	return box({ layout: { width: percent(0.3) } }, text({ color: gray }, content));
}

function text(properties: TextProps, content: string): HostElement {
	const element = host.createElement('text');
	setProperties(element, properties);
	host.insertBefore(element, host.createLiteral(content));
	return element;
}

function setProperties(element: HostElement, properties: object): void {
	for (const [name, value] of Object.entries(properties)) {
		host.setProperty(element, name, value);
	}
}
