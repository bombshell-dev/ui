import { fileURLToPath } from 'node:url';
import { createFixture } from '@bomb.sh/tools/test-utils';
import { describe, expect, it } from 'vitest';
import { loadTerminfo, resolveTerminfoPath } from './terminfo.js';

// Valid little-endian legacy magic (0x011A) + a couple payload bytes.
const MAGIC = (): Buffer => Buffer.from([0x1a, 0x01, 0x00, 0xff]);

// Compare URLs by their filesystem path, independent of slash/encoding nuances.
const samePath = (a: URL | undefined, b: URL): boolean =>
	a !== undefined && fileURLToPath(a) === fileURLToPath(b);

describe('resolveTerminfoPath', () => {
	it('finds a file in a Linux-style letter directory', async () => {
		const fixture = await createFixture({
			x: { 'xterm-256color': MAGIC() },
		});
		const root = fileURLToPath(fixture.root);
		const url = await resolveTerminfoPath({
			term: 'xterm-256color',
			env: { TERMINFO: root },
		});
		expect(samePath(url, fixture.resolve('x', 'xterm-256color'))).toBe(true);
	});

	it('finds a file under $HOME/.terminfo', async () => {
		// createFixture's inline tree can't express a dotted directory key
		// (it treats any name containing "." as a file), so write the
		// $HOME/.terminfo entry imperatively via the scoped hfs API.
		const fixture = await createFixture({});
		await fixture.write('.terminfo/x/xterm-256color', MAGIC());
		const url = await resolveTerminfoPath({
			term: 'xterm-256color',
			env: { HOME: fileURLToPath(fixture.root) },
		});
		expect(samePath(url, fixture.resolve('.terminfo', 'x', 'xterm-256color'))).toBe(true);
	});

	it('finds a file in a macOS-style hex directory', async () => {
		const fixture = await createFixture({
			'78': { 'xterm-256color': MAGIC() },
		});
		const root = fileURLToPath(fixture.root);
		const url = await resolveTerminfoPath({
			term: 'xterm-256color',
			env: { TERMINFO: root },
		});
		expect(samePath(url, fixture.resolve('78', 'xterm-256color'))).toBe(true);
	});

	it('prefers $TERMINFO over $TERMINFO_DIRS', async () => {
		const fixture = await createFixture({
			a: { x: { 'xterm-256color': MAGIC() } },
			b: { x: { 'xterm-256color': MAGIC() } },
		});
		const url = await resolveTerminfoPath({
			term: 'xterm-256color',
			env: {
				TERMINFO: fileURLToPath(fixture.resolve('a')),
				TERMINFO_DIRS: fileURLToPath(fixture.resolve('b')),
			},
		});
		expect(samePath(url, fixture.resolve('a', 'x', 'xterm-256color'))).toBe(true);
	});

	it('searches a $TERMINFO_DIRS entry', async () => {
		const fixture = await createFixture({
			b: { x: { 'xterm-256color': MAGIC() } },
		});
		const url = await resolveTerminfoPath({
			term: 'xterm-256color',
			env: { TERMINFO_DIRS: fileURLToPath(fixture.resolve('b')) },
		});
		expect(samePath(url, fixture.resolve('b', 'x', 'xterm-256color'))).toBe(true);
	});

	it('skips files without a valid terminfo magic number', async () => {
		const fixture = await createFixture({
			x: { 'xterm-256color': Buffer.from([0x00, 0x00, 0x00]) },
		});
		const root = fileURLToPath(fixture.root);
		const badPath = fixture.resolve('x', 'xterm-256color');
		const url = await resolveTerminfoPath({
			term: 'xterm-256color',
			env: { TERMINFO: root },
		});
		// The bad-magic file must be skipped. Resolution may fall back to a real
		// system terminfo (or undefined on machines without one), but it must
		// never return the bad file itself.
		expect(url === undefined || fileURLToPath(url) !== fileURLToPath(badPath)).toBe(true);
	});

	it('returns undefined for a missing terminal name', async () => {
		expect(await resolveTerminfoPath({ env: {} })).toBeUndefined();
		expect(await resolveTerminfoPath({ term: '', env: {} })).toBeUndefined();
	});

	it('rejects names containing a path separator', async () => {
		expect(await resolveTerminfoPath({ term: '../etc/passwd', env: {} })).toBeUndefined();
	});

	it('rejects names that try to traverse directories', async () => {
		expect(await resolveTerminfoPath({ term: '..', env: {} })).toBeUndefined();
		expect(await resolveTerminfoPath({ term: '.', env: {} })).toBeUndefined();
	});
});

describe('loadTerminfo', () => {
	it('returns the file bytes', async () => {
		const fixture = await createFixture({
			x: { 'xterm-256color': MAGIC() },
		});
		const root = fileURLToPath(fixture.root);
		const bytes = await loadTerminfo({
			term: 'xterm-256color',
			env: { TERMINFO: root },
		});
		expect(bytes).toBeDefined();
		expect(Array.from(bytes!)).toEqual([0x1a, 0x01, 0x00, 0xff]);
	});

	it('returns undefined when not found', async () => {
		const fixture = await createFixture({ empty: {} });
		const root = fileURLToPath(fixture.root);
		const bytes = await loadTerminfo({
			term: 'nope',
			env: { TERMINFO: root },
		});
		expect(bytes).toBeUndefined();
	});
});
