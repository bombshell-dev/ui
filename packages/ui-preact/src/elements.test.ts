import type {
	HostElements as CoreHostElements,
	HostElement,
	BrowserElement,
	InputEvent,
} from '@clack/ui';
import type { ComponentChildren } from 'preact';
import { describe, expectTypeOf, test } from 'vitest';
import type { JSX } from './jsx-runtime.ts';

interface PreactProbeEvent {
	readonly value: number;
}

interface PreactProbeProps {
	count: number;
	onprobe?: (event: PreactProbeEvent) => void;
}

declare module '@clack/ui/elements' {
	interface HostElements {
		'@test/preact-probe': PreactProbeProps;
	}
}

describe('Preact host elements', () => {
	test('keeps browser capabilities out of core element refs', () => {
		expectTypeOf<
			Extract<
				keyof HostElement,
				'ownerDocument' | 'style' | 'getBoundingClientRect' | 'dispatchEvent'
			>
		>().toEqualTypeOf<never>();
		expectTypeOf<BrowserElement['dispatchEvent']>().toBeFunction();
		expectTypeOf<BrowserElement['getBoundingClientRect']>().toBeFunction();
	});

	test('maps box and text properties from the core registry', () => {
		expectTypeOf<JSX.IntrinsicElements['box']['layout']>().toEqualTypeOf<
			CoreHostElements['box']['layout']
		>();
		expectTypeOf<JSX.IntrinsicElements['text']['color']>().toEqualTypeOf<
			CoreHostElements['text']['color']
		>();
		expectTypeOf<JSX.IntrinsicElements['box']['children']>().toEqualTypeOf<ComponentChildren>();
	});

	test('maps lowercase host event properties to Preact casing', () => {
		expectTypeOf<NonNullable<JSX.IntrinsicElements['input']['onInput']>>()
			.parameter(0)
			.toEqualTypeOf<InputEvent>();
		expectTypeOf<
			'oninput' extends keyof JSX.IntrinsicElements['input'] ? true : false
		>().toEqualTypeOf<false>();
	});

	test('derives custom elements from core registry augmentation', () => {
		expectTypeOf<JSX.IntrinsicElements['@test/preact-probe']['count']>().toEqualTypeOf<number>();
		expectTypeOf<NonNullable<JSX.IntrinsicElements['@test/preact-probe']['onProbe']>>()
			.parameter(0)
			.toEqualTypeOf<PreactProbeEvent>();
	});
});
