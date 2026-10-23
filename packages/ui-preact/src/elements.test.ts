import type { Element, Event } from '@clack/ui';
import type { Ref } from 'preact';
import { expectTypeOf, it } from 'vitest';
import type { JSX } from './jsx-runtime.ts';

it('types JSX against Clack without advertising browser-only APIs', () => {
	type Props = JSX.IntrinsicElements['span'];
	expectTypeOf<Props['ref']>().toEqualTypeOf<Ref<Element> | undefined>();
	expectTypeOf<NonNullable<Props['onKeyDown']>>().parameter(0).toEqualTypeOf<Event>();
	expectTypeOf<Props['style']>().toEqualTypeOf<undefined>();
	expectTypeOf<Props['dangerouslySetInnerHTML']>().toEqualTypeOf<undefined>();
	expectTypeOf<JSX.IntrinsicElements['svg']>().toBeNever();
	expectTypeOf<JSX.IntrinsicElements['math']>().toBeNever();
	expectTypeOf<JSX.IntrinsicElements['template']>().toBeNever();
});
