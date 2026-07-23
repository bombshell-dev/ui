import type { FunctionComponent, ReactNode } from 'react';
import { Box, Text, createRoot, rgba } from '@clack/ui-react';

const cyan = rgba(0, 205, 205);
const green = rgba(0, 205, 0);
const white = rgba(229, 229, 229);
const gray = rgba(127, 127, 127);
const blue = rgba(0, 0, 238);
const yellow = rgba(238, 238, 0);

// Same UI as examples/basic, but composed with react components.
const Field: FunctionComponent<{ label: string; children?: ReactNode }> = ({ label, children }) => (
	<Box layout={{ direction: 'ltr', gap: 2 }}>
		<Text color={gray}>{label}</Text>
		{children}
	</Box>
);

const App: FunctionComponent = () => (
	<Box
		layout={{ direction: 'ttb', gap: 1, padding: { top: 1, bottom: 1, left: 2, right: 2 } }}
		border={{ color: blue, top: 1, right: 1, bottom: 1, left: 1 }}
	>
		<Text color={cyan}>@clack/ui · react</Text>
		<Box layout={{ direction: 'ttb' }}>
			<Field label="status ">
				<Text color={green}>● ready</Text>
			</Field>
			<Field label="version">
				<Text color={white}>0.0.0</Text>
			</Field>
			<Field label="render ">
				<Text color={yellow}>@bomb.sh/tty</Text>
			</Field>
		</Box>
	</Box>
);

const root = await createRoot();
root.render(<App />);
