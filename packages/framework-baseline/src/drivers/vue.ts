import {
	createApp,
	h,
	nextTick,
	shallowReactive,
	vModelCheckbox,
	vModelSelect,
	vModelText,
	withDirectives,
	type VNode,
} from 'vue';
import type { Driver, Props } from '../scenario.ts';

function App(
	props: Props,
	state: { count: number; text: string; area: string; checked: boolean; choice: string },
): VNode {
	return h('div', { id: 'app', class: props.className, style: { color: props.color } }, [
		h('button', { id: 'inc', onClick: () => state.count++ }, String(state.count)),
		h(
			'ul',
			null,
			props.items.map((item) => h('li', { key: item }, item)),
		),
		props.show ? h('p', { id: 'cond' }, 'shown') : null,
		h('div', { id: 'html', innerHTML: props.html }),
		// `v-model` compiles to these directives; templates are not available without the compiler.
		withDirectives(
			h('input', { id: 'text', 'onUpdate:modelValue': (value: string) => (state.text = value) }),
			[[vModelText, state.text]],
		),
		h('span', { id: 'echo' }, state.text),
		withDirectives(
			h('textarea', { id: 'area', 'onUpdate:modelValue': (value: string) => (state.area = value) }),
			[[vModelText, state.area]],
		),
		h('span', { id: 'area-echo' }, state.area),
		withDirectives(
			h('input', {
				id: 'check',
				type: 'checkbox',
				'onUpdate:modelValue': (value: boolean) => (state.checked = value),
			}),
			[[vModelCheckbox, state.checked]],
		),
		h('span', { id: 'check-echo' }, state.checked ? 'on' : 'off'),
		withDirectives(
			h(
				'select',
				{ id: 'choice', 'onUpdate:modelValue': (value: string) => (state.choice = value) },
				[h('option', { value: 'a' }, 'A'), h('option', { value: 'b' }, 'B')],
			),
			[[vModelSelect, state.choice]],
		),
		h('span', { id: 'choice-echo' }, state.choice),
		h('svg', null, [h('circle', { r: props.radius })]),
	]);
}

export const driver: Driver = {
	async mount(container, props) {
		const external = shallowReactive<Props>({ ...props });
		const state = shallowReactive({ count: 0, text: '', area: '', checked: false, choice: 'a' });

		const app = createApp({
			setup() {
				return () => App(external, state);
			},
		});
		app.mount(container);

		return {
			async update(next) {
				Object.assign(external, next);
				await nextTick();
			},
			async flush() {
				await nextTick();
			},
			async unmount() {
				app.unmount();
			},
		};
	},
};
