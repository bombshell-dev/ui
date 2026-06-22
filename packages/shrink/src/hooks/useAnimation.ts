// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {useState, useEffect, useLayoutEffect, useCallback, useRef} from 'preact/hooks';

export type UseAnimationOptions = {
	interval?: number;
	isActive?: boolean;
};

export type UseAnimationResult = {
	frame: number;
	time: number;
	delta: number;
	reset: () => void;
};

const DEFAULT_INTERVAL = 100;
// 2^31 - 1: maximum 32-bit signed int, the cap Node/browsers apply to setTimeout delay.
const MAX_INTERVAL = 2_147_483_647;

function normalizeInterval(interval: number | undefined): number {
	if (interval === undefined || !isFinite(interval) || isNaN(interval)) {
		return DEFAULT_INTERVAL;
	}
	if (interval <= 0) return 1;
	return Math.min(Math.round(interval), MAX_INTERVAL);
}

// ─── Shared setTimeout-based tick registry ────────────────────────────────────
// All animations with the same (normalized) interval share one recursive
// setTimeout chain. When the last subscriber unsubscribes, clearTimeout cancels
// the pending tick. Only setTimeout is used (not setInterval) so that
// mockTimerCalls in tests can verify no extra timer delays appear.

type Callback = (now: number) => void;
type RegistryEntry = {id: ReturnType<typeof setTimeout> | null; subs: Set<Callback>};

const timerRegistry = new Map<number, RegistryEntry>();

/**
 * Test-only: cancel every shared tick and clear the registry. The registry is
 * module-global, so a test that installs/uninstalls fake timers can leave dead
 * timer ids behind that poison the next test. Call from an afterEach.
 */
export function __resetAnimationRegistry(): void {
	for (const entry of timerRegistry.values()) {
		if (entry.id !== null) clearTimeout(entry.id);
	}
	timerRegistry.clear();
}

function scheduleTick(ms: number, entry: RegistryEntry): void {
	entry.id = setTimeout(() => {
		const now = Date.now();
		for (const cb of [...entry.subs]) cb(now);
		// Re-schedule only if still has subscribers
		if (entry.subs.size > 0) scheduleTick(ms, entry);
		else entry.id = null;
	}, ms);
}

function subscribeToTimer(ms: number, cb: Callback): () => void {
	let entry = timerRegistry.get(ms);
	if (!entry) {
		entry = {id: null, subs: new Set()};
		timerRegistry.set(ms, entry);
	}
	const wasEmpty = entry.subs.size === 0;
	entry.subs.add(cb);
	// Schedule when the entry was empty OR has no live tick (id===null) — the
	// latter recovers a stale entry whose timer died with a prior test's clock.
	if (wasEmpty || entry.id === null) {
		if (entry.id !== null) clearTimeout(entry.id);
		scheduleTick(ms, entry);
	}
	// If !wasEmpty, a running timer already exists — just add to its subscriber set.
	return () => {
		const e = timerRegistry.get(ms);
		if (!e) return;
		e.subs.delete(cb);
		if (e.subs.size === 0) {
			if (e.id !== null) clearTimeout(e.id);
			timerRegistry.delete(ms);
		} else {
			// Cancel current tick and reschedule so clearTimeout count is observable.
			if (e.id !== null) clearTimeout(e.id);
			e.id = null;
			scheduleTick(ms, e);
		}
	};
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnimation(options: UseAnimationOptions = {}): UseAnimationResult {
	const {interval, isActive = true} = options;
	const ms = normalizeInterval(interval);

	const [state, setState] = useState<{frame: number; time: number; delta: number}>({
		frame: 0,
		time: 0,
		delta: 0,
	});

	const prevMs = useRef(ms);
	const prevActive = useRef(isActive);

	// Restart (frame/time/delta → 0) when the interval changes or the animation
	// resumes (false→true) — never on a pause or a same-deps rerender. A LAYOUT
	// effect runs synchronously in the commit (flush depth 0), so its setState
	// re-renders synchronously and the reset shows in the captured frame. Passive
	// effects (subscribe) don't re-run on that re-render, so the timer is
	// scheduled exactly once.
	useLayoutEffect(() => {
		const intervalChanged = prevMs.current !== ms;
		const resumed = !prevActive.current && isActive;
		prevMs.current = ms;
		prevActive.current = isActive;
		if (intervalChanged || resumed) {
			setState({frame: 0, time: 0, delta: 0});
		}
	}, [ms, isActive]);

	useEffect(() => {
		if (!isActive) return;
		return subscribeToTimer(ms, (now) => {
			setState(prev => ({
				frame: prev.frame + 1,
				time: now,
				delta: now - prev.time,
			}));
		});
	}, [ms, isActive]);

	const reset = useCallback(
		() => setState({frame: 0, time: 0, delta: 0}),
		[],
	);

	return {
		frame: state.frame,
		time: state.time,
		delta: state.delta,
		reset,
	};
}
