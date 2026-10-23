# `@clack/ui-preact`

Mount Preact 11 into any Clack element. No browser DOM, global `document`, or DOM adapter is needed.

```tsx
import { createUI } from '@clack/ui';
import { createRoot } from '@clack/ui-preact';

await using ui = await createUI({ input: process.stdin, output: process.stdout });
const container = ui.document.createElement('div');
ui.document.documentElement.appendChild(container);

using root = createRoot(container);
root.render(<span>Hello World!</span>);

// Run until your application exits its scope and disposes the UI.
await ui.main();
```

Configure TypeScript with `"jsx": "react-jsx"` and `"jsxImportSource": "@clack/ui-preact"`.
Use components and hooks from `preact` and `preact/hooks` as usual. JSX refs refer to Clack
elements, and event handlers receive Clack events, not browser events.

`root.render(node)` updates the element's children. `root.unmount()` removes that tree and
allows a later render. Disposing the root with `using` calls `unmount()`. Preact owns effect
cleanup; passive effect cleanup follows Preact's asynchronous scheduling.

Roots may be nested in an existing DOM tree or attached after rendering while detached.
Keep one root per container. Its contents belong to Preact; siblings outside the container
are unaffected. Separate roots can use separate Clack documents. Preact 11's `createPortal`
also accepts Clack elements directly.

This first integration intentionally has no style support. Tags do not imply HTML semantics,
and `style`, HTML parsing, browser APIs, hydration, and `preact/compat` are not part of this
surface. Preact's reserved `svg`, `math`, and `template` tags are also unsupported.
Native keyboard and mouse input will be added separately; dispatched Clack events
already work with Preact handlers.

See [the animated greeting example](../../examples/hello-world-preact/README.md).
