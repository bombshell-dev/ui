// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {options} from 'preact';

// Binding-layer scheduling (INV-4). The base host (@clack/ui) exposes a node
// model + IR walk; deciding WHEN a Preact commit produces a stable frame —
// and guarding re-entrancy — is Preact-specific and lives here.

// Preact schedules PASSIVE effects (useEffect) via requestAnimationFrame.
// Layout effects (useLayoutEffect) already run synchronously in the commit.
//
// By default we flush passive effects synchronously (fn()) so the live render()
// path behaves predictably and animation subscriptions fire immediately.
//
// During a synchronous renderToString() we DEFER passive effects: the captured
// frame must reflect layout-effect updates but NOT passive-effect state updates
// (ink semantics — `captures initial render output before effect-driven updates`).
// renderToString sets defer=true, captures the frame, then drains the queue so
// passive setups run (registering cleanups) before unmount runs those cleanups.
let _deferPassive = false;
const _passiveQueue: Array<() => void> = [];

export function setDeferPassiveEffects(value: boolean): void {
	_deferPassive = value;
}

export function isDeferPassiveEffects(): boolean {
	return _deferPassive;
}

export function drainPassiveEffects(): void {
	// Drain inside the flush guard so a drained effect's setState defers its
	// re-render (to a microtask) instead of re-entering and re-running sibling
	// effects — same protection scheduleFlush gives the live path.
	_flushDepth++;
	try {
		while (_passiveQueue.length > 0) {
			const fn = _passiveQueue.shift()!;
			fn();
		}
	} finally {
		_flushDepth--;
	}
}

// Re-entrancy-safe flush scheduler. A top-level flush runs synchronously (so
// renderToString and synchronous assertions observe effects); a flush requested
// WHILE one is running (an effect's setState/dispatch) is deferred to a
// microtask instead of re-entering the commit — re-entering would re-run sibling
// effects (duplicate timer subscriptions / focus registrations / remounts).
let _flushDepth = 0;

export function scheduleFlush(fn: () => void): void {
	if (_flushDepth > 0) {
		queueMicrotask(() => scheduleFlush(fn));
		return;
	}
	_flushDepth++;
	try {
		fn();
	} finally {
		_flushDepth--;
	}
}

if (!(options as any).__rAFPatched) {
	(options as any).__rAFPatched = true;
	(options as any).requestAnimationFrame = (fn: () => void) => {
		// During a synchronous renderToString, queue for manual draining.
		// Otherwise defer to a microtask (NOT a synchronous call): a synchronous
		// flush lets an effect's setState re-enter the commit and re-run sibling
		// effects (duplicate timer subscriptions, duplicate focus registration).
		// A microtask still resolves before any awaited assertion in tests.
		if (_deferPassive) _passiveQueue.push(fn);
		else scheduleFlush(fn);
	};
}

// ─── Commit trigger ───────────────────────────────────────────────────────────
// After each Preact batch flush (state/effect-driven), refresh every registered
// renderer. This is the binding's job: it knows WHEN Preact has committed; the
// renderer (in @clack/ui) knows HOW to produce a frame. Patching
// debounceRendering makes the flush synchronous; scheduleFlush defers a
// re-entrant flush (an effect's setState mid-commit) so siblings aren't re-run.
const _refreshers = new Set<() => void>();
let _debouncePatched = false;

/** Register a callback to run after each Preact commit. Returns an unsubscribe. */
export function onPreactFlush(fn: () => void): () => void {
	ensureDebouncePatched();
	_refreshers.add(fn);
	return () => {
		_refreshers.delete(fn);
	};
}

/** Test-only: forget all registered refreshers so a leaked one can't fire. */
export function __resetRefreshers(): void {
	_refreshers.clear();
}

function ensureDebouncePatched(): void {
	if (_debouncePatched) return;
	_debouncePatched = true;
	(options as any).debounceRendering = (fn: () => void) => {
		scheduleFlush(() => {
			fn();
			for (const refresh of [..._refreshers]) refresh();
		});
	};
}
