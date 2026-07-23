import type { BoxProps, TextProps } from '@clack/ui';
import { type FunctionComponent, type ReactNode, createElement } from 'react';

/** A box; props are a 1:1 passthrough to `@clack/ui`'s `box`. */
export const Box: FunctionComponent<BoxProps & { children?: ReactNode }> = (props) =>
	createElement('tui-box', props);

/** A run of text; props are a 1:1 passthrough to `@clack/ui`'s `text`. */
export const Text: FunctionComponent<TextProps & { children?: ReactNode }> = (props) =>
	createElement('tui-text', props);
