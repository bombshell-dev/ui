import { h } from 'preact';
import type { FunctionComponent } from 'preact';
import { createRoot, Box, Text, rgba } from '@clack/ui-preact';

const cyan = rgba(0, 205, 205);
const green = rgba(0, 205, 0);
const white = rgba(229, 229, 229);
const gray = rgba(127, 127, 127);
const blue = rgba(0, 0, 238);

// A labeled row: dim label + a value node beside it.
const Field: FunctionComponent<{ label: string }> = ({ label, children }) =>
	h(Box, { layout: { direction: 'ltr', gap: 1 } }, h(Text, { color: gray }, label), children);

const App: FunctionComponent = () =>
	h(
		Box,
		{
			layout: { direction: 'ttb', gap: 1, padding: { top: 1, bottom: 1, left: 2, right: 2 } },
			border: { color: blue, top: 1, right: 1, bottom: 1, left: 1 },
		},
		h(Text, { color: cyan }, '@clack/ui · preact'),
		h(
			Box,
			{ layout: { direction: 'ttb' } },
			h(Field, { label: 'status ' }, h(Text, { color: green }, '● ready')),
			h(Field, { label: 'version' }, h(Text, { color: white }, '0.0.0')),
			h(Field, { label: 'render ' }, h(Text, { color: white }, '@bomb.sh/tty')),
		),
	);

const root = await createRoot();
root.render(h(App, {}));
