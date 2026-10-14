// oxlint-disable bombshell-dev/exported-function-async -- Property updates must finish during synchronous host lifecycle hooks.
// oxlint-disable bombshell-dev/max-params -- Mirrors source/target forwarding with an explicit whitelist and optional defaults.
import type { HostElement } from '../elements.ts';
import type { BoxProps } from '../primitives/box.ts';
import type { TextProps } from '../primitives/text.ts';

export const boxProperties = [
	'layout',
	'border',
	'bg',
	'cornerRadius',
	'clip',
	'floating',
	'transition',
] as const satisfies readonly (keyof BoxProps)[];
export const textProperties = [
	'color',
	'bg',
	'fontSize',
	'fontId',
	'wrap',
	'attrs',
	'caret',
] as const satisfies readonly (keyof TextProps)[];

/** Forward only primitive capabilities, never host identity or semantic/event properties. */
export function setSelectedProperties(
	source: HostElement,
	target: HostElement,
	names: readonly string[],
	defaults: Record<string, unknown> = {},
): void {
	for (const name of names) target.setProperty(name, source.properties[name] ?? defaults[name]);
}
