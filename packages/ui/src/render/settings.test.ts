import { describe, expect, test } from 'vitest';
import { resolveSettings } from './settings.ts';

/** Escape-sequence fragments emitted by the tty settings helpers (verified against v0.8.0). */
const Seq = {
	altBuffer: '?1049h',
	hideCursor: '?25l',
	showCursor: '?25h',
	mouseAny: '?1003h',
	mouseSgr: '?1006h',
	keyboard: '>3u',
} as const;

const decoder = new TextDecoder();
const apply = (setting: { apply: Uint8Array }) => decoder.decode(setting.apply);

describe('resolveSettings', () => {
	test('fullscreen + [key,mouse] enables alt buffer, hides cursor, mouse, kitty level 3', () => {
		const out = apply(resolveSettings({ mode: 'fullscreen', events: ['key', 'mouse'] }));
		expect(out).toContain(Seq.altBuffer);
		expect(out).toContain(Seq.hideCursor);
		expect(out).toContain(Seq.mouseAny);
		expect(out).toContain(Seq.mouseSgr);
		expect(out).toContain(Seq.keyboard);
	});

	test('inline shows the cursor and omits the alt buffer', () => {
		const out = apply(resolveSettings({ mode: 'inline', events: ['key'] }));
		expect(out).not.toContain(Seq.altBuffer);
		expect(out).toContain(Seq.showCursor);
		expect(out).not.toContain(Seq.mouseAny);
	});

	test('omitting key/mouse omits their sequences', () => {
		const out = apply(resolveSettings({ mode: 'fullscreen', events: [] }));
		expect(out).not.toContain(Seq.mouseAny);
		expect(out).not.toContain(Seq.keyboard);
	});
});
