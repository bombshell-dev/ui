import { stdin, stdout } from 'node:process';
import { createInput, fixed, grow, percent, type Input, type InputEvent } from '@bomb.sh/tty';
import { createUI, DispatchApi } from '@clack/ui';
import { createRoot, rgba } from '@clack/ui-react';
import { type ReactElement, useState } from 'react';

const blue = rgba(0, 0, 238);
const cyan = rgba(0, 205, 205);
const gray = rgba(127, 127, 127);

function HelloWorld(): ReactElement {
	const [say, setSay] = useState('Hello');
	const [to, setTo] = useState('World');

	return (
		<box
			layout={{
				direction: 'ttb',
				gap: 1,
				padding: { top: 1, bottom: 1, left: 2, right: 2 },
				width: fixed(40),
			}}
			border={{ color: blue, top: 1, right: 1, bottom: 1, left: 1 }}
		>
			<text color={cyan}>
				{say}, {to}!
			</text>
			<box layout={{ direction: 'ttb', width: grow() }}>
				<box layout={{ direction: 'ltr', gap: 1, width: grow() }}>
					<box layout={{ width: percent(0.3) }}>
						<text color={gray}>say:</text>
					</box>
					<box layout={{ width: percent(0.3) }}>
						<text color={gray}>to:</text>
					</box>
				</box>
				<box layout={{ direction: 'ltr', gap: 1, width: grow() }}>
					<input onInput={(event) => setSay(event.value)} />
					<input onInput={(event) => setTo(event.value)} />
				</box>
			</box>
		</box>
	);
}

class InteractiveTerminalRequiredError extends Error {
	readonly code = 'CLACK_EXAMPLE_INTERACTIVE_TERMINAL_REQUIRED';

	constructor() {
		super('the React example requires an interactive terminal');
		this.name = 'InteractiveTerminalRequiredError';
	}
}

if (!stdin.isTTY) {
	throw new InteractiveTerminalRequiredError();
}

const ui = await createUI({ output: stdout });
const root = createRoot(ui.host);
const { host } = root;

try {
	root.render(<HelloWorld />);
	await readInput(await createInput());
} finally {
	await ui.dispose();
	root.unmount();
}

async function readInput(input: Input): Promise<void> {
	let resolveCompleted: () => void;
	let rejectCompleted: (reason: unknown) => void;
	const completed = new Promise<void>((resolve, reject) => {
		resolveCompleted = resolve;
		rejectCompleted = reject;
	});
	let pending: ReturnType<typeof setTimeout> | undefined;
	let done = false;

	function finish(): void {
		if (!done) {
			done = true;
			resolveCompleted();
		}
	}

	function fail(reason: unknown): void {
		if (!done) {
			done = true;
			rejectCompleted(reason);
		}
	}

	function scan(bytes?: Uint8Array): void {
		if (done) return;
		if (pending) clearTimeout(pending);
		pending = undefined;

		try {
			const result = input.scan(bytes);
			for (const event of result.events) {
				if (isExit(event)) {
					finish();
					return;
				}

				const dispatched = DispatchApi.methods.dispatch(host.root, event);
				if (!dispatched.ok) throw dispatched.reason;
			}

			if (result.pending && !done) {
				pending = setTimeout(scan, result.pending.delay);
			}
		} catch (error) {
			fail(error);
		}
	}

	function onData(bytes: Buffer): void {
		scan(bytes);
	}

	try {
		stdin.on('data', onData);
		stdin.once('end', finish);
		stdin.once('error', fail);
		stdin.setRawMode(true);
		stdin.resume();
		await completed;
	} finally {
		if (pending) clearTimeout(pending);
		stdin.off('data', onData);
		stdin.off('end', finish);
		stdin.off('error', fail);
		stdin.setRawMode(false);
		stdin.pause();
	}
}

function isExit(event: InputEvent): boolean {
	return event.type === 'keydown' && event.ctrl === true && event.code === 'c';
}
