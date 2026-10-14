// oxlint-disable bombshell-dev/exported-function-async -- Solid components synchronously return Host elements.
import type { HostElement } from '@clack/ui/elements';
import type { BoxProps, ButtonProps, DialogProps, InputProps, TextProps } from './elements.ts';
import { createElement, spread } from './renderer.ts';

export type { BoxProps, ButtonProps, DialogProps, InputProps, TextProps } from './elements.ts';

/** A layout container backed by the Host's `box` element. */
export function Box(props: BoxProps): HostElement {
	const element = createElement('box') as HostElement;
	spread(element, props);
	return element;
}

/** A styled text scope backed by the Host's `text` element. */
export function Text(props: TextProps): HostElement {
	const element = createElement('text') as HostElement;
	spread(element, props);
	return element;
}

/** A focusable control backed by the Host's `button` element. */
export function Button(props: ButtonProps): HostElement {
	const element = createElement('button') as HostElement;
	spread(element, props);
	return element;
}

/** A text input backed by the Host's `input` element. */
export function Input(props: InputProps): HostElement {
	const element = createElement('input') as HostElement;
	spread(element, props);
	return element;
}

/** A composed modal-style panel backed by the Host's `dialog` element. */
export function Dialog(props: DialogProps): HostElement {
	const element = createElement('dialog') as HostElement;
	spread(element, props);
	return element;
}
