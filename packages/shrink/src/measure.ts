// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {getLastRenderInfo} from '@clack/ui';
import type {FakeElement} from '@clack/ui/dom';

// A handle to a rendered host element — what `<Box ref>` gives you.
export type DOMElement = FakeElement;

export type Size = {width: number; height: number};

/**
 * Measure a Box's laid-out size (display columns × rows) from the most recent
 * render. Returns {0,0} before the first layout. Mirrors ink's measureElement.
 */
export function measureElement(node: DOMElement | null | undefined): Size {
	const id = (node as {__clayId?: string} | null | undefined)?.__clayId;
	const bounds = id ? getLastRenderInfo()?.get(id)?.bounds : undefined;
	return {width: bounds?.width ?? 0, height: bounds?.height ?? 0};
}
