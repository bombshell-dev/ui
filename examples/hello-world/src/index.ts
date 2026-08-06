import { stdin, stdout } from 'node:process';
import { createInput, fixed, grow, percent, type Input, type InputEvent } from '@bomb.sh/tty';
import {
	type BoxProps,
	createUI,
	DispatchApi,
	type HostElement,
	rgba,
	type TextProps,
} from '@clack/ui';

class InteractiveTerminalRequiredError extends Error {
	readonly code = 'CLACK_EXAMPLE_INTERACTIVE_TERMINAL_REQUIRED';

	constructor() {
		super('the hello-world example requires an interactive terminal');
		this.name = 'InteractiveTerminalRequiredError';
	}
}

if (!stdin.isTTY) {
	throw new InteractiveTerminalRequiredError();
}

const blue = rgba(0, 0, 238);
const cyan = rgba(0, 205, 205);
const gray = rgba(127, 127, 127);

const ui = await createUI({ output: stdout });
const { host } = ui;

try {
	const sayInput = host.createElement('input');
	const toInput = host.createElement('input');

  const say = host.createText("Hello");
  const comma = host.createText(", ");
  const to = host.createText("World");
  const bang = host.createText("!");
  
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
				padding: { top: 1, bottom: 1, left: 2, right: 2 },
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
	await readInput(await createInput());
} finally {
	await ui.dispose();
}

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
	host.insertBefore(element, host.createText(content));
	return element;
}

function setProperties(element: HostElement, properties: object): void {
	for (const [name, value] of Object.entries(properties)) {
		host.setProperty(element, name, value);
	}
}

function formatGreeting(phrase: string, recipient: string): string {
	return `${phrase}, ${recipient}!`;
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
