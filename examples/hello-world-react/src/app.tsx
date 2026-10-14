// oxlint-disable bombshell-dev/exported-function-async -- React components render synchronously.
import { fit, fixed, grow, percent } from '@bomb.sh/tty';
import { rgba } from '@clack/ui';
import { Button as BaseButton } from '@base-ui/react/button';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { type ReactElement, useRef, useState } from 'react';

interface ToastMessageState {
	id: number;
	phase: 'entering' | 'visible' | 'exiting';
}

/** Render the interactive hello-world example. */
export function HelloWorld(): ReactElement {
	const [say, setSay] = useState('Hello');
	const [to, setTo] = useState('World');
	const [baseButtonCount, setBaseButtonCount] = useState(0);
	const [baseSwitchChecked, setBaseSwitchChecked] = useState(false);
	const [baseSliderValue, setBaseSliderValue] = useState(50);
	const [baseTogglePressed, setBaseTogglePressed] = useState(false);
	const [toast, setToast] = useState<ToastMessageState | null>(null);
	const nextToastId = useRef(0);
	const sliderPosition = Math.round((baseSliderValue / 100) * 11);

	function showToast(): void {
		const id = ++nextToastId.current;
		setToast({ id, phase: 'entering' });
		setTimeout(
			() =>
				setToast((current) => (current?.id === id ? { ...current, phase: 'visible' } : current)),
			16,
		);
		setTimeout(
			() =>
				setToast((current) => (current?.id === id ? { ...current, phase: 'exiting' } : current)),
			4000,
		);
		setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 4180);
	}

	return (
		<box
			layout={{ direction: 'ttb', width: fixed(terminalWidth()), height: grow() }}
			clip={{ horizontal: true }}
		>
			<box
				layout={{
					direction: 'ttb',
					gap: 1,
					padding: { top: 1, bottom: 1, left: 2, right: 2 },
					width: grow(1, 40),
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
					<box layout={{ direction: 'ltr', gap: 1, width: grow() }} clip={{ horizontal: true }}>
						<input layout={{ width: fit() }} onInput={(event) => setSay(event.value)} />
						<input layout={{ width: fit() }} onInput={(event) => setTo(event.value)} />
					</box>
					<text color={gray}>Base UI Button activations: {baseButtonCount}</text>
					<BaseButton onClick={() => setBaseButtonCount((count) => count + 1)}>
						Base UI Button
					</BaseButton>
					<box layout={{ direction: 'ltr', gap: 1 }}>
						<BaseSwitch.Root checked={baseSwitchChecked} onCheckedChange={setBaseSwitchChecked}>
							<BaseSwitch.Thumb />
						</BaseSwitch.Root>
						<text>Base UI Switch: {baseSwitchChecked ? 'on' : 'off'}</text>
					</box>
					<BaseToggle pressed={baseTogglePressed} onPressedChange={setBaseTogglePressed}>
						Base UI Toggle: {baseTogglePressed ? 'on' : 'off'}
					</BaseToggle>
					<BaseButton onClick={showToast}>Show Toast</BaseButton>
					<text color={gray}>Slider: {baseSliderValue}</text>
					<BaseSlider.Root
						value={baseSliderValue}
						onValueChange={(value) =>
							setBaseSliderValue(Array.isArray(value) ? (value[0] ?? 0) : value)
						}
					>
						<BaseSlider.Control
							render={
								<box
									layout={{
										direction: 'ltr',
										width: grow(1, 26),
										height: fit(1),
									}}
								/>
							}
						>
							<text color={cyan}>
								{'-'.repeat(sliderPosition)}o{'-'.repeat(11 - sliderPosition)}
							</text>
							<BaseSlider.Track render={<box layout={{ width: percent(0.9), height: fit(1) }} />}>
								<BaseSlider.Indicator />
							</BaseSlider.Track>
							<BaseSlider.Thumb />
						</BaseSlider.Control>
					</BaseSlider.Root>
				</box>
			</box>
			<ToastMessage toast={toast} />
		</box>
	);
}

function ToastMessage({ toast }: { toast: ToastMessageState | null }): ReactElement | null {
	if (!toast) return null;
	const toastWidth = Math.max(1, Math.min(32, terminalWidth()));
	const descriptionLines = wrapText('Changes saved', Math.max(1, toastWidth - 4));
	return (
		<box
			layout={{
				direction: 'ttb',
				width: fixed(toastWidth),
				height: fit(1),
				gap: 1,
				padding: { top: 1, bottom: 1, left: 1, right: 1 },
			}}
			floating={{
				attachTo: 'parent',
				attachPoints: { element: 'right-top', parent: 'right-top' },
				x: toast.phase === 'visible' ? 0 : 32,
				y: 1,
				zIndex: 10,
			}}
			transition={{ duration: 0.18, easing: 'easeOut', properties: ['position'] }}
			border={{ color: cyan, top: 1, right: 1, bottom: 1, left: 1 }}
		>
			<text color={cyan}>Saved</text>
			{descriptionLines.map((line, index) => (
				<text key={index}>{line}</text>
			))}
		</box>
	);
}

function terminalWidth(): number {
	return (
		(globalThis as typeof globalThis & { window?: { innerWidth?: number } }).window?.innerWidth ??
		80
	);
}

function wrapText(value: string, width: number): string[] {
	const lines: string[] = [];
	let line = '';
	for (const word of value.split(/\s+/)) {
		let remaining = word;
		while (remaining.length > width) {
			if (line) {
				lines.push(line);
				line = '';
			}
			lines.push(remaining.slice(0, width));
			remaining = remaining.slice(width);
		}
		if (line && line.length + remaining.length + 1 > width) {
			lines.push(line);
			line = remaining;
		} else {
			line = line ? `${line} ${remaining}` : remaining;
		}
	}
	if (line) lines.push(line);
	return lines;
}

const blue = rgba(0, 0, 238);
const cyan = rgba(0, 205, 205);
const gray = rgba(127, 127, 127);
