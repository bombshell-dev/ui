import type {
	HostElements as CoreHostElements,
	HostElement,
	BrowserElement,
	InputEvent,
} from '@clack/ui';
import type { ReactNode } from 'react';
import { describe, expectTypeOf, test } from 'vitest';
import type { JSX } from './jsx-runtime.ts';

interface ReactProbeEvent {
	readonly value: number;
}

interface ReactProbeProps {
	count: number;
	onprobe?: (event: ReactProbeEvent) => void;
}

declare module '@clack/ui/elements' {
	interface HostElements {
		'@test/react-probe': ReactProbeProps;
	}
}

describe('React host elements', () => {
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
		expectTypeOf<JSX.IntrinsicElements['box']['children']>().toEqualTypeOf<ReactNode | undefined>();
	});

	test('maps lowercase host event properties to React casing', () => {
		expectTypeOf<NonNullable<JSX.IntrinsicElements['input']['onInput']>>()
			.parameter(0)
			.toEqualTypeOf<InputEvent>();
		expectTypeOf<
			'oninput' extends keyof JSX.IntrinsicElements['input'] ? true : false
		>().toEqualTypeOf<false>();
	});

	test('derives custom elements from core registry augmentation', () => {
		expectTypeOf<JSX.IntrinsicElements['@test/react-probe']['count']>().toEqualTypeOf<number>();
		expectTypeOf<NonNullable<JSX.IntrinsicElements['@test/react-probe']['onProbe']>>()
			.parameter(0)
			.toEqualTypeOf<ReactProbeEvent>();
	});
});
