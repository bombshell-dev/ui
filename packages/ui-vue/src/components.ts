import { type FunctionalComponent, h } from 'vue';
import type { BoxProps, TextProps } from './elements.ts';

export type { BoxProps, TextProps } from './elements.ts';

/** A layout container backed by the Host's `box` element. */
export const Box: FunctionalComponent<BoxProps> = (props, { slots }) =>
	h('box', props, slots.default?.());

/** A styled text scope backed by the Host's `text` element. */
export const Text: FunctionalComponent<TextProps> = (props, { slots }) =>
	h('text', props, slots.default?.());
