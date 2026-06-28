// Run: node examples/counter.ts  (from packages/ui)
// A standalone host driving RenderRoot imperatively: state lives here, render() is called on change.
// The animated bar uses a v0.8.0 declarative transition to exercise the animation-frame loop.
import { box, createRoot, fixed, rgba, text } from '../src/index.ts';

const ac = new AbortController();
const root = await createRoot({ signal: ac.signal });

let count = 0;
const accent = rgba(120, 200, 255);
const muted = rgba(120, 120, 140);

const view = () =>
	box(
		{ layout: { direction: 'ttb', padding: { left: 2, top: 1 }, gap: 1 } },
		text({ color: accent }, `count: ${count}`),
		// Width animates when count changes → render() returns animating:true → follow-up frames.
		box({
			layout: { width: fixed(count * 2 + 1), height: fixed(1) },
			bg: accent,
			transition: { duration: 0.2, easing: 'easeOut', properties: ['width'] },
		}),
		text({ color: muted }, '↑/↓ to change · q or Ctrl+C to quit'),
	);

root.subscribe((event) => {
	if (event.type !== 'keydown') return;
	if (event.key === 'ArrowUp') count++;
	else if (event.key === 'ArrowDown') count = Math.max(0, count - 1);
	else if (event.key === 'q' || (event.ctrl && event.key === 'c')) {
		ac.abort(); // → unmount(): restores the terminal
		process.exit(0);
	}
	root.render(view());
});

root.render(view());
