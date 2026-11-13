import { h, render, type JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { Driver, Props } from '../scenario.ts';

function App(props: Props): JSX.Element {
	const [count, setCount] = useState(0);
	const [pings, setPings] = useState(0);
	const [text, setText] = useState('');
	const [area, setArea] = useState('');
	const [checked, setChecked] = useState(false);
	const [choice, setChoice] = useState('a');
	return h(
		'div',
		{ id: 'app', class: props.className, style: { color: props.color } },
		h('button', { id: 'inc', onClick: () => setCount((value) => value + 1) }, count),
		h(
			'button',
			{ id: 'ping', onClick: props.listen ? () => setPings((value) => value + 1) : undefined },
			pings,
		),
		h(
			'ul',
			null,
			props.items.map((item) => h('li', { key: item }, item)),
		),
		props.show && h('p', { id: 'cond' }, 'shown'),
		h('div', { id: 'html', dangerouslySetInnerHTML: { __html: props.html } }),
		h('input', {
			id: 'text',
			value: text,
			onInput: (event: Event) => setText((event.currentTarget as HTMLInputElement).value),
		}),
		h('span', { id: 'echo' }, text),
		h('textarea', {
			id: 'area',
			value: area,
			onInput: (event: Event) => setArea((event.currentTarget as HTMLTextAreaElement).value),
		}),
		h('span', { id: 'area-echo' }, area),
		h('input', {
			id: 'check',
			type: 'checkbox',
			checked,
			onChange: (event: Event) => setChecked((event.currentTarget as HTMLInputElement).checked),
		}),
		h('span', { id: 'check-echo' }, checked ? 'on' : 'off'),
		h(
			'select',
			{
				id: 'choice',
				value: choice,
				onChange: (event: Event) => setChoice((event.currentTarget as HTMLSelectElement).value),
			},
			h('option', { value: 'a' }, 'A'),
			h('option', { value: 'b' }, 'B'),
		),
		h('span', { id: 'choice-echo' }, choice),
		h('svg', null, h('circle', { r: props.radius })),
	);
}

/** Preact batches state updates on a timeout. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

export const driver: Driver = {
	async mount(container, props) {
		render(h(App, props), container);
		return {
			async update(next) {
				render(h(App, next), container);
			},
			flush: settle,
			async unmount() {
				render(null, container);
			},
		};
	},
};
