import { type BoxProps, type TextProps, rgba } from '@clack/ui';
import { useBoxElement } from '../../../packages/ui/src/elements/box.ts';
import { useTextElement } from '../../../packages/ui/src/elements/text.ts';
import { createHost, type HostElement } from '../../../packages/ui/src/host.ts';
import { layout } from '../../../packages/ui/src/layout.ts';
import { RenderRoot } from '../../../packages/ui/src/render/createRoot.ts';

const cyan = rgba(0, 205, 205);
const green = rgba(0, 205, 0);
const white = rgba(229, 229, 229);
const gray = rgba(127, 127, 127);
const blue = rgba(0, 0, 238);

const host = createHost();
useBoxElement(host);
useTextElement(host);

const app = box(
	{
		layout: { direction: 'ttb', gap: 1, padding: { top: 1, bottom: 1, left: 2, right: 2 } },
		border: { color: blue, top: 1, right: 1, bottom: 1, left: 1 },
	},
	text({ color: cyan }, '@clack/ui'),
	box(
		{ layout: { direction: 'ttb' } },
		row('status ', text({ color: green }, '● ready')),
		row('version', text({ color: white }, '0.0.0')),
		row('render ', text({ color: white }, '@bomb.sh/tty')),
	),
);

host.insertBefore(host.element, app);

const renderer = new RenderRoot();
await renderer.ready();
renderer.render(...layout(app.node!));

function box(properties: Omit<BoxProps, 'key'>, ...children: HostElement[]): HostElement {
	const element = host.createElement('box');
	setProperties(element, properties);
	for (const child of children) {
		host.insertBefore(element, child);
	}
	return element;
}

function text(properties: TextProps, content: string): HostElement {
	const element = host.createElement('text');
	setProperties(element, properties);
	host.insertBefore(element, host.createText(content));
	return element;
}

function row(label: string, value: HostElement): HostElement {
	return box({ layout: { direction: 'ltr', gap: 1 } }, text({ color: gray }, label), value);
}

function setProperties(element: HostElement, properties: object): void {
	for (const [name, value] of Object.entries(properties)) {
		host.setProperty(element, name, value);
	}
}
