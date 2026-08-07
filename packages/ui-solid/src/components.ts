// oxlint-disable bombshell-dev/exported-function-async -- Solid components synchronously return Host elements.
import type { HostElement } from '@clack/ui/elements';
import type { BoxProps, TextProps } from './elements.ts';
import { createElement, spread } from './renderer.ts';

export type { BoxProps, TextProps } from './elements.ts';

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
