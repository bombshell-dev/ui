import { createSignal, For, Show, type JSX } from 'solid-js';
import { render } from 'solid-js/web';
import html from 'solid-js/html';
import type { Driver, Props } from '../scenario.ts';

export const driver: Driver = {
	async mount(container, initial) {
		const [props, setProps] = createSignal<Props>(initial);
		const [count, setCount] = createSignal(0);
		const [text, setText] = createSignal('');
		const [area, setArea] = createSignal('');
		const [checked, setChecked] = createSignal(false);
		const [choice, setChoice] = createSignal('a');

		function App(): JSX.Element {
			return html`
				<div id="app" class=${() => props().className} style=${() => ({ color: props().color })}>
					<button id="inc" onClick=${() => setCount((value) => value + 1)}>${count}</button>
					<ul>
						<${For} each=${() => props().items}>${(item: string) => html`<li>${item}</li>`}<//>
					</ul>
					<${Show} when=${() => props().show}>
						<p id="cond">shown</p>
					<//>
					<div id="html" innerHTML=${() => props().html}></div>
					<input
						id="text"
						value=${text}
						onInput=${(event: Event) => setText((event.currentTarget as HTMLInputElement).value)}
					/>
					<span id="echo">${text}</span>
					<textarea
						id="area"
						value=${area}
						onInput=${(event: Event) => setArea((event.currentTarget as HTMLTextAreaElement).value)}
					></textarea>
					<span id="area-echo">${area}</span>
					<input
						id="check"
						type="checkbox"
						checked=${checked}
						onChange=${(event: Event) => setChecked((event.currentTarget as HTMLInputElement).checked)}
					/>
					<span id="check-echo">${() => (checked() ? 'on' : 'off')}</span>
					<select
						id="choice"
						value=${choice}
						onChange=${(event: Event) => setChoice((event.currentTarget as HTMLSelectElement).value)}
					>
						<option value="a">A</option>
						<option value="b">B</option>
					</select>
					<span id="choice-echo">${choice}</span>
					<svg><circle r=${() => props().radius} /></svg>
				</div>
			`;
		}

		const dispose = render(App, container);

		return {
			async update(next) {
				setProps(next);
			},
			async flush() {
				await Promise.resolve();
			},
			async unmount() {
				dispose();
			},
		};
	},
};
