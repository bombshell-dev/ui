import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse, defaultTreeAdapter as tree, type DefaultTreeAdapterTypes } from 'parse5';

export interface SourceScript {
	file: string;
	code: string;
	lineOffset?: number;
	columnOffset?: number;
}

export interface SourceFile {
	html: string;
	scripts: SourceScript[];
	title?: string;
}

class UnsupportedSourceError extends Error {}

const origin = 'https://web-platform.test';
const harnessPath = 'resources/testharness.js';
const reporterPath = 'resources/testharnessreport.js';
const javascriptTypes = new Set([
	'application/ecmascript',
	'application/javascript',
	'application/x-ecmascript',
	'application/x-javascript',
	'text/ecmascript',
	'text/javascript',
	'text/javascript1.0',
	'text/javascript1.1',
	'text/javascript1.2',
	'text/javascript1.3',
	'text/javascript1.4',
	'text/javascript1.5',
	'text/jscript',
	'text/livescript',
	'text/x-ecmascript',
	'text/x-javascript',
]);

/** Extract static scripts without rewriting upstream code or fixture markup. */
export async function loadSource(file: string, sourceRoot: string): Promise<SourceFile> {
	const root = await realpath(sourceRoot);
	const filename = await checkedPath(file, root);
	const path = decodeURIComponent(
		pathToFileURL(filename).href.slice(checkoutURL(root).href.length),
	);
	if (/\.sub\.(?:html|js)$/.test(path)) {
		throw new UnsupportedSourceError(`Server-substituted WPT sources are not supported: ${path}`);
	}
	const code = await readFile(filename, 'utf8');
	const source = { path, root };
	if (path.endsWith('.any.js') || path.endsWith('.window.js')) {
		const scripts: SourceScript[] = [];
		let title: string | undefined;
		for (const [, key, value] of code.matchAll(/^\/\/\s*META:\s*(\w+)\s*=\s*(.*?)\s*$/gm)) {
			if (key === 'script') {
				const script = await loadHelper(value!, source);
				if (script) {
					scripts.push(script);
				}
			} else if (key === 'title') {
				title = value;
			} else if (key === 'variant') {
				throw new UnsupportedSourceError(`WPT URL variants are not supported: ${path}`);
			} else if (key === 'global' && !value!.split(',').some((name) => name.trim() === 'window')) {
				throw new UnsupportedSourceError(
					`Only the window variant of JavaScript WPT files is supported: ${path}`,
				);
			}
		}
		scripts.push({ file: filename, code });
		return { html: '', scripts, title };
	}
	if (!path.endsWith('.html')) {
		throw new UnsupportedSourceError(`Unsupported WPT source type: ${path}`);
	}
	const document = parse(code, { sourceCodeLocationInfo: true });
	const elements: DefaultTreeAdapterTypes.Element[] = [];
	const pending: DefaultTreeAdapterTypes.Node[] = [document];
	let title: string | undefined;
	while (pending.length > 0) {
		const node = pending.pop()!;
		if (tree.isElementNode(node)) {
			if (node.tagName === 'script') {
				if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml') {
					throw new UnsupportedSourceError(`Non-HTML script elements are not supported: ${path}`);
				}
				elements.push(node);
			} else if (node.tagName === 'base' && node.attrs.some(({ name }) => name === 'href')) {
				throw new UnsupportedSourceError(`WPT fixtures with a base URL are not supported: ${path}`);
			} else if (node.tagName === 'title' && title === undefined) {
				title = node.childNodes
					.filter(tree.isTextNode)
					.map((child) => child.value)
					.join('');
			}
		}
		if ('childNodes' in node) {
			for (let index = node.childNodes.length - 1; index >= 0; index--) {
				pending.push(node.childNodes[index]!);
			}
		}
	}
	elements.sort((a, b) => a.sourceCodeLocation!.startOffset - b.sourceCodeLocation!.startOffset);
	const scripts: SourceScript[] = [];
	for (const element of elements) {
		const attributes = new Map(element.attrs.map(({ name, value }) => [name, value]));
		const type = attributes.get('type')?.trim().toLowerCase() ?? '';
		if (type === 'module' || attributes.has('async') || attributes.has('defer')) {
			throw new UnsupportedSourceError(
				`Module and asynchronous script loading are not supported: ${path}`,
			);
		}
		if (type && !javascriptTypes.has(type)) {
			continue;
		}
		const src = attributes.get('src');
		if (src !== undefined) {
			const script = await loadHelper(src, source);
			if (script) {
				scripts.push(script);
			}
		} else {
			const location = element.sourceCodeLocation!;
			const start = location.startTag!;
			scripts.push({
				file: filename,
				code: code.slice(start.endOffset, location.endTag?.startOffset ?? location.endOffset),
				lineOffset: start.endLine - 1,
				columnOffset: start.endCol - 1,
			});
		}
	}
	return { html: code, scripts, title };
}

async function loadHelper(
	src: string,
	{ path, root }: { path: string; root: string },
): Promise<SourceScript | null> {
	const url = new URL(src, `${origin}/${path}`);
	const helper = decodeURIComponent(url.pathname).slice(1);
	if (url.origin !== origin || url.search || /\.(?:sub\.js|py)$/.test(helper)) {
		throw new UnsupportedSourceError(
			`Only static helpers from the WPT checkout are supported: ${src}`,
		);
	}
	if (helper === harnessPath || helper === reporterPath) {
		return null;
	}
	const file = await checkedPath(
		fileURLToPath(new URL(url.pathname.slice(1), checkoutURL(root))),
		root,
	);
	return { file, code: await readFile(file, 'utf8') };
}

async function checkedPath(file: string, root: string): Promise<string> {
	const filename = await realpath(file);
	if (!pathToFileURL(filename).href.startsWith(checkoutURL(root).href)) {
		throw new UnsupportedSourceError(`WPT sources must be inside the source checkout: ${file}`);
	}
	return filename;
}

function checkoutURL(root: string): URL {
	return pathToFileURL(root.endsWith('/') ? root : `${root}/`);
}
