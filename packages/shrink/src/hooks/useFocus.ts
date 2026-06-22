// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {useContext, useEffect, useRef} from 'preact/hooks';
import {FocusContext} from './FocusContext.ts';

let autoId = 0;

export function useFocus(options: {autoFocus?: boolean; isActive?: boolean; id?: string} = {}): {isFocused: boolean} {
	const {autoFocus = false, isActive = true, id: customId} = options;
	const ctx = useContext(FocusContext);

	// Stable id for the lifetime of the component (generated if not supplied).
	const generatedId = useRef<string>();
	generatedId.current ??= `shrink-focus-${autoId++}`;
	const id = customId ?? generatedId.current;

	// Register on mount (capturing the initial autoFocus/isActive), unregister on unmount.
	useEffect(() => {
		ctx.add(id, {autoFocus, isActive});
		return () => ctx.remove(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	// Keep the registry's isActive in sync with later changes.
	useEffect(() => {
		ctx.setActive(id, isActive);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, isActive]);

	return {isFocused: ctx.activeId === id};
}
