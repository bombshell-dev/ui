// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
// Re-export everything from preact/compat and add a minimal `act` shim.
// Our render() is synchronous, so act just needs to call the callback and
// flush pending microtasks before returning.
//
// `export *` does NOT forward the default export, so `import React from 'react'`
// consumers using React.useState/React.useEffect need it re-exported. This file
// is the target of the `react` alias in consumers' test/build config.
export {default} from 'preact/compat';
export * from 'preact/compat';

// preact/compat ships no named `act`, so our local `act` below is the only one.
export async function act(callback: () => Promise<void> | void): Promise<void> {
	const result = callback();
	if (result && typeof (result as Promise<void>).then === 'function') {
		await result;
	}
	// Flush any queued microtasks (e.g. Promise.resolve chains inside render)
	await Promise.resolve();
}
