import type { VNode, ContainerNode } from 'preact';
import type { ReadStream, WriteStream } from 'node:tty';
import { render as _render, options as _options } from 'preact';
import { createDocument } from './dom.ts';

const document = createDocument();
// guard against `ReferenceError` with global `document` access
// remove once https://github.com/preactjs/preact/pull/5119 lands
if (!('document' in globalThis)) {
    (globalThis as { document?: unknown }).document = undefined;
}

export function render(vnode: VNode, opts: {
    input?: WriteStream;
    output?: ReadStream;
}) {
    _render(vnode, document.body as unknown as ContainerNode);
}

