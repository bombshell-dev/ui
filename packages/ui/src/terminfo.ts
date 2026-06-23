import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export interface TerminfoOptions {
	/** Terminal name to resolve. Defaults to env.TERM. */
	term?: string;
	/**
	 * Environment used for TERM / TERMINFO / TERMINFO_DIRS / HOME lookups.
	 * Defaults to process.env. Injectable for testing.
	 */
	env?: Record<string, string | undefined>;
}

// Compiled-in fallback locations, searched in order (ncurses convention).
const DEFAULT_DIRS = ['/usr/share/terminfo', '/etc/terminfo', '/lib/terminfo', '/usr/lib/terminfo'];

// Little-endian terminfo magic numbers: legacy 16-bit (0x011A, octal 0432)
// and extended 32-bit number format (0x021E, octal 01036).
const MAGIC_LEGACY = 0x011a;
const MAGIC_EXTENDED = 0x021e;

function hasTerminfoMagic(bytes: Uint8Array): boolean {
	if (bytes.length < 2) return false;
	const magic = bytes[0] | (bytes[1] << 8);
	return magic === MAGIC_LEGACY || magic === MAGIC_EXTENDED;
}

// Turn a directory path into a file URL ending in "/" so that
// `new URL(child, dir)` resolves children *under* it.
function dirUrl(path: string): URL {
	return pathToFileURL(path.endsWith('/') ? path : `${path}/`);
}

function searchPath(env: Record<string, string | undefined>): URL[] {
	const dirs: URL[] = [];
	const seen = new Set<string>();
	const add = (url: URL): void => {
		if (!seen.has(url.href)) {
			seen.add(url.href);
			dirs.push(url);
		}
	};
	if (env.TERMINFO) add(dirUrl(env.TERMINFO));
	if (env.HOME) add(new URL('.terminfo/', dirUrl(env.HOME)));
	if (env.TERMINFO_DIRS) {
		for (const entry of env.TERMINFO_DIRS.split(':')) {
			// An empty entry stands in for the compiled-in defaults.
			if (entry === '') for (const dir of DEFAULT_DIRS) add(dirUrl(dir));
			else add(dirUrl(entry));
		}
	}
	// Compiled-in defaults are always the final fallback (ncurses convention).
	for (const dir of DEFAULT_DIRS) add(dirUrl(dir));
	return dirs;
}

function candidates(base: URL, name: string): URL[] {
	const first = name[0];
	// macOS stores under a two-hex-digit dir; Linux uses the first letter.
	const hex = first.charCodeAt(0).toString(16).padStart(2, '0');
	return [new URL(`${first}/${name}`, base), new URL(`${hex}/${name}`, base)];
}

async function tryRead(url: URL): Promise<Uint8Array | undefined> {
	try {
		return await readFile(url);
	} catch {
		return undefined;
	}
}

async function find(
	options: TerminfoOptions,
): Promise<{ url: URL; bytes: Uint8Array } | undefined> {
	const env = options.env ?? process.env;
	const name = options.term ?? env.TERM;
	if (!name) return undefined;
	// Reject path separators, NUL, and leading dots (no traversal; terminfo
	// names never begin with '.').
	if (name.startsWith('.') || name.includes('/') || name.includes('\\') || name.includes('\0')) {
		return undefined;
	}
	for (const base of searchPath(env)) {
		for (const url of candidates(base, name)) {
			const bytes = await tryRead(url);
			if (bytes && hasTerminfoMagic(bytes)) return { url, bytes };
		}
	}
	return undefined;
}

/** Resolve the `file://` URL of a compiled terminfo file, or undefined. */
export async function resolveTerminfoPath(options: TerminfoOptions = {}): Promise<URL | undefined> {
	return (await find(options))?.url;
}

/**
 * Load a compiled terminfo binary as bytes, ready for createInput({ terminfo }).
 * Returns undefined when no terminfo file can be found.
 */
export async function loadTerminfo(options: TerminfoOptions = {}): Promise<Uint8Array | undefined> {
	return (await find(options))?.bytes;
}
