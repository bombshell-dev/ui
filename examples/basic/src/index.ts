import { box, text, createRoot, rgba } from '@clack/ui';

const cyan = rgba(0, 205, 205);
const green = rgba(0, 205, 0);
const white = rgba(229, 229, 229);
const gray = rgba(127, 127, 127);
const blue = rgba(0, 0, 238);

// Framework-free: build a tree with `box` / `text`, render it once.
const root = await createRoot();

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

root.render(app);

function row(label: string, value: ReturnType<typeof text>) {
	return box({ layout: { direction: 'ltr', gap: 1 } }, text({ color: gray }, label), value);
}
