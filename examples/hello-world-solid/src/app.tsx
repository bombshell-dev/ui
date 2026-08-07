// oxlint-disable bombshell-dev/exported-function-async -- Solid components render synchronously.
import { fixed, grow, percent } from '@bomb.sh/tty';
import { type JSXElement, rgba } from '@clack/ui-solid';
import { createSignal } from 'solid-js';

/** Render the interactive hello-world example. */
export function HelloWorld(): JSXElement {
	const [say, setSay] = createSignal('Hello');
	const [to, setTo] = createSignal('World');

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
				{say()}, {to()}!
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

const blue = rgba(0, 0, 238);
const cyan = rgba(0, 205, 205);
const gray = rgba(127, 127, 127);
