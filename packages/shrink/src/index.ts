export {render, renderToString, renderToStringAsync, type Instance, type RenderOptions, type RenderToStringOptions} from './ink.ts';
// Generic components live in the binding (@clack/ui-preact); shrink re-exports
// them under the ink surface. Static is ink-specific and stays here.
export {Box, Text, Transform, Newline, Spacer} from '@clack/ui-preact';
export {Static} from './components/Static.tsx';
export {useApp} from './hooks/AppContext.ts';
export {useStdin} from './hooks/StdinContext.ts';
export {useStdout, useStderr} from './hooks/StdoutContext.ts';
export {useInput, type Key} from './hooks/useInput.ts';
export {useCursor} from './hooks/useCursor.ts';
export {useFocus} from './hooks/useFocus.ts';
export {useFocusManager} from './hooks/useFocusManager.ts';
export type {RenderMetrics} from './ink.ts';
export {useAnimation, type UseAnimationOptions, type UseAnimationResult} from './hooks/useAnimation.ts';
export {measureElement, type DOMElement, type Size} from './measure.ts';
export {useWindowSize, type WindowSize} from './hooks/useWindowSize.ts';
