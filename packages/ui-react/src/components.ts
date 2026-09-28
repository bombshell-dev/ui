import { type FunctionComponent, createElement } from 'react';
import type { BoxProps, ButtonProps, DialogProps, InputProps, TextProps } from './elements.ts';

export type { BoxProps, ButtonProps, DialogProps, InputProps, TextProps } from './elements.ts';

/** A layout container backed by the Host's `box` element. */
export const Box: FunctionComponent<BoxProps> = (props) => createElement('box', props);

/** A styled text scope backed by the Host's `text` element. */
export const Text: FunctionComponent<TextProps> = (props) => createElement('text', props);

/** A focusable control backed by the Host's `button` element. */
export const Button: FunctionComponent<ButtonProps> = (props) => createElement('button', props);

/** A text input backed by the Host's `input` element. */
export const Input: FunctionComponent<InputProps> = (props) => createElement('input', props);

/** A composed modal-style panel backed by the Host's `dialog` element. */
export const Dialog: FunctionComponent<DialogProps> = (props) => createElement('dialog', props);
