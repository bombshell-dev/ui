import { createElement as h, useState, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { Driver, Props } from '../scenario.ts';

function App(props: Props): ReactElement {
	const [count, setCount] = useState(0);
	const [pings, setPings] = useState(0);
	const [text, setText] = useState('');
	const [area, setArea] = useState('');
	const [checked, setChecked] = useState(false);
	const [choice, setChoice] = useState('a');
	return h(
		'div',
		{ id: 'app', className: props.className, style: { color: props.color } },
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
			onChange: (event: { currentTarget: HTMLInputElement }) => setText(event.currentTarget.value),
		}),
		h('span', { id: 'echo' }, text),
		h('textarea', {
			id: 'area',
			value: area,
			onChange: (event: { currentTarget: HTMLTextAreaElement }) =>
				setArea(event.currentTarget.value),
		}),
		h('span', { id: 'area-echo' }, area),
		h('input', {
			id: 'check',
			type: 'checkbox',
			checked,
			onChange: (event: { currentTarget: HTMLInputElement }) =>
				setChecked(event.currentTarget.checked),
		}),
		h('span', { id: 'check-echo' }, checked ? 'on' : 'off'),
		h(
			'select',
			{
				id: 'choice',
				value: choice,
				onChange: (event: { currentTarget: HTMLSelectElement }) =>
					setChoice(event.currentTarget.value),
			},
			h('option', { value: 'a' }, 'A'),
			h('option', { value: 'b' }, 'B'),
		),
		h('span', { id: 'choice-echo' }, choice),
		h('svg', null, h('circle', { r: props.radius })),
	);
}

/** React batches state updates; flushSync forces a synchronous commit. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

export const driver: Driver = {
	async mount(container, props) {
		let root!: Root;
		flushSync(() => {
			root = createRoot(container);
			root.render(h(App, props));
		});
		return {
			async update(next) {
				flushSync(() => {
					root.render(h(App, next));
				});
			},
			flush: settle,
			async unmount() {
				flushSync(() => {
					root.unmount();
				});
			},
		};
	},
};
