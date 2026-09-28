import { createUI, rgba } from '@clack/ui';

const cyan = rgba(0, 205, 205);
const green = rgba(0, 205, 0);
const white = rgba(229, 229, 229);
const gray = rgba(127, 127, 127);
const blue = rgba(0, 0, 238);

await using ui = await createUI({
	height: 7,
	inline: true,
	input: process.stdin,
	output: process.stdout,
});

const { host } = ui;

const app = host.createElement(
	'box',
	{
		layout: { direction: 'ttb', gap: 1, padding: { top: 1, bottom: 1, left: 2, right: 2 } },
		border: { color: blue, top: 1, right: 1, bottom: 1, left: 1 },
	},
	host.createElement('text', { color: cyan }, '@clack/ui'),
	host.createElement(
		'box',
		{ layout: { direction: 'ttb' } },
		host.createElement(
			'box',
			{ layout: { direction: 'ltr', gap: 1 } },
			host.createElement('text', { color: gray }, 'status '),
			host.createElement('text', { color: green }, '● ready'),
		),
		host.createElement(
			'box',
			{ layout: { direction: 'ltr', gap: 1 } },
			host.createElement('text', { color: gray }, 'version'),
			host.createElement('text', { color: white }, '0.0.0'),
		),
		host.createElement(
			'box',
			{ layout: { direction: 'ltr', gap: 1 } },
			host.createElement('text', { color: gray }, 'render '),
			host.createElement('text', { color: white }, '@bomb.sh/tty'),
		),
	),
);

host.element.append(app);
