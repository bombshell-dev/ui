import type { HostElements as CoreHostElements, InputEvent } from '@clack/ui';
import { describe, expectTypeOf, test } from 'vitest';
import type { JSX } from './jsx-runtime.ts';
import type { JSXElement } from './types.ts';

interface SolidProbeEvent {
	readonly value: number;
}

interface SolidProbeProps {
	count: number;
	onprobe?: (event: SolidProbeEvent) => void;
}

declare module '@clack/ui/elements' {
	interface HostElements {
		'@test/solid-probe': SolidProbeProps;
	}
}

describe('Solid host elements', () => {
	test('maps box and text properties from the core registry', () => {
		expectTypeOf<JSX.IntrinsicElements['box']['layout']>().toEqualTypeOf<
			CoreHostElements['box']['layout']
		>();
		expectTypeOf<JSX.IntrinsicElements['text']['color']>().toEqualTypeOf<
			CoreHostElements['text']['color']
		>();
		expectTypeOf<JSX.IntrinsicElements['box']['children']>().toEqualTypeOf<
			JSXElement | undefined
		>();
	});

	test('maps lowercase host event properties to Solid casing', () => {
		expectTypeOf<NonNullable<JSX.IntrinsicElements['input']['onInput']>>()
			.parameter(0)
			.toEqualTypeOf<InputEvent>();
		expectTypeOf<
			'oninput' extends keyof JSX.IntrinsicElements['input'] ? true : false
		>().toEqualTypeOf<false>();
	});

	test('derives custom elements from core registry augmentation', () => {
		expectTypeOf<JSX.IntrinsicElements['@test/solid-probe']['count']>().toEqualTypeOf<number>();
		expectTypeOf<NonNullable<JSX.IntrinsicElements['@test/solid-probe']['onProbe']>>()
			.parameter(0)
			.toEqualTypeOf<SolidProbeEvent>();
	});
});
