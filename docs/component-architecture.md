# Component Architecture

## Goals

- Keep host elements familiar to DOM users across vanilla JavaScript, React, Preact, and Solid.
- Keep terminal-specific operations inside rendering primitives.
- Make composed components use the same host tree as built-in elements.
- Hide the middleware runtime from normal element and component authors.

## Element Layers

- `HostElement` is the DOM-like tree node. It owns properties, children, parentage, text content, and event listeners.
- `primitives/` contains the smallest tty-backed elements, such as `text` and `box`, that emit terminal operations directly.
- `elements/` contains browser-like controls such as `button` and `input`; their implementations compose primitives and add focus, keyboard, and event behavior.
- `components/` contains higher-level UI such as `dialog`, which creates and arranges existing elements.

Every element is composable regardless of whether its implementation is primitive or composed. A parent only sees a host element and asks the host layout system to lay it out.

## Lifecycle

Class-backed elements use DOM-style lifecycle hooks:

- `create()` builds the persistent child tree once, on first attachment.
- `connectedCallback()` runs whenever the element is attached.
- `disconnectedCallback()` runs whenever the element is detached.
- `focusedCallback()` and `blurredCallback()` run when focus changes.
- `update(previousProps)` updates existing children after properties change.
- `keydown()` and `keyrepeat()` handle keyboard input.
- `layout()` emits terminal operations for primitives.

`create()` is intentionally not named `render()`. It does not run every frame. `layout()` may run every frame, but it only emits terminal operations and does not recreate host elements.

## Public Host API

The public composition surface is intentionally DOM-like:

```ts
const dialog = host.createElement('box', {},
	host.createElement('text', {}, 'Delete this file?'),
);

const confirm = host.createElement('button', { label: 'Delete' });
confirm.addEventListener('press', deleteFile);
dialog.append(confirm);
host.element.append(dialog);
```

Host elements support `createElement`, `append`, `prepend`, `replaceChildren`, `remove`, `setProperty`, `textContent`, `addEventListener`, and `removeEventListener`.

Event properties such as `onpress` are also accepted by the vanilla host API. Framework adapters map their familiar forms, such as React's `onPress`, to the same event listener system.

## Middleware

Middleware remains a runtime implementation tool for cross-cutting behavior such as dispatch, focus, rendering, and keyboard input. Element authors should use `definePrimitive`, `defineComponent`, and lifecycle hooks instead of installing `LayoutApi`, `KeyboardApi`, or `HostApi` middleware directly.

Advanced integrations can use the public `DispatchApi`, `EmitApi`, `FocusApi`, `KeyboardApi`, `LayoutApi`, and `RenderApi` exports. `RenderApi.requestRender()` records invalidation and schedules a frame; it does not draw immediately.

The built-ins are registered through `installBuiltins`. Individual registrations are available through `Box.register(host)`, `Text.register(host)`, `Button.register(host)`, `Input.register(host)`, and `Dialog.register(host)` when a host needs a smaller set.

## Events

Host events have a stable `target`, a changing `currentTarget`, and bubble through parent host elements by default. Listeners can call `stopPropagation()` to stop bubbling. Listener registration remains identity-based and preserves registration order.

Raw dispatch returns `{ ok, handled }`, while semantic emission returns `{ handled, stopped }`. Middleware is the extension point for cross-cutting event policy; element methods and host listeners remain the normal default-action and application APIs.

## Rendering

Host mutations invalidate the affected layout subtree and its ancestors, then issue render requests rather than drawing synchronously. Render middleware coalesces requests into one frame in the render loop. Unchanged retained subtrees reuse tty-packed layout snapshots, while each frame still performs the necessary full-tree traversal for correctness. `@bomb.sh/tty` retains terminal state and reduces the resulting operations to output changes.

## Design Boundary

Do not implement partial Lit-style rendering accidentally. If a future declarative `render()` API is added, it should have explicit reactive updates and child reconciliation. Until then, composed class elements use `create()` plus `update()` and preserve child identity.
