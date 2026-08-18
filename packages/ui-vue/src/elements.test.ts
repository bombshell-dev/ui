import type { HostElements as CoreHostElements, InputEvent } from '@clack/ui';
import type { VNodeChild } from 'vue';
import { describe, expectTypeOf, test } from 'vitest';
import type { JSX } from './jsx-runtime.ts';

interface VueProbeEvent {
	readonly value: number;
}

interface VueProbeProps {
	count: number;
	onprobe?: (event: VueProbeEvent) => void;
}

declare module '@clack/ui/elements' {
	interface HostElements {
		'@test/vue-probe': VueProbeProps;
	}
}

describe('Vue host elements', () => {
	test('maps box and text properties from the core registry', () => {
		expectTypeOf<JSX.IntrinsicElements['box']['layout']>().toEqualTypeOf<
			CoreHostElements['box']['layout']
		>();
		expectTypeOf<JSX.IntrinsicElements['text']['color']>().toEqualTypeOf<
			CoreHostElements['text']['color']
		>();
		expectTypeOf<JSX.IntrinsicElements['box']['children']>().toEqualTypeOf<
			VNodeChild | undefined
		>();
	});

	test('maps lowercase host event properties to Vue casing', () => {
		expectTypeOf<NonNullable<JSX.IntrinsicElements['input']['onInput']>>()
			.parameter(0)
			.toEqualTypeOf<InputEvent>();
		expectTypeOf<
			'oninput' extends keyof JSX.IntrinsicElements['input'] ? true : false
		>().toEqualTypeOf<false>();
	});

	test('derives custom elements from core registry augmentation', () => {
		expectTypeOf<JSX.IntrinsicElements['@test/vue-probe']['count']>().toEqualTypeOf<number>();
		expectTypeOf<NonNullable<JSX.IntrinsicElements['@test/vue-probe']['onProbe']>>()
			.parameter(0)
			.toEqualTypeOf<VueProbeEvent>();
	});
});
