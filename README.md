# `@clack/ui`

Make your terminal sing with a flexible and performat UI!

Built on [`@bomb.sh/tty`](https://github.com/bombshell-dev/clayterm), a low-level, platform-independent terminal renderer and event parser for JavaScript.

Looking for help? Start with our [Getting Started][docs] guide.

## Install

The UI is comes with bindings to various rendering libraries. You may directly install `@clack/ui` by running the following command, but recommend using a binding for improved DX.

```sh
npm install @clack/ui
```

## Vanilla JavaScript

`@clack/ui` exposes a small host tree that can be composed without a framework.
Call `installBuiltins(host)` when using the vanilla host directly.
Elements accept properties and children when they are created, and provide
DOM-like methods for later updates:

```ts
const message = host.createElement('text', { color: cyan }, 'Hello, ', 'world!');
const app = host.createElement('box', { layout: { direction: 'ttb' } }, message);

host.element.append(app);
message.setProperty('color', green);
```

Reusable components can be registered on a host. The definition is applied to
elements created by the host and by rendering-library adapters:

```ts
class GreetingCard extends ComponentElement {
	create() {
		this.element.append(this.element.createElement('text', {}, 'Hello!'));
	}

	update(previousProps) {
		// Update existing children when properties change.
	}
}

const Greeting = defineComponent('greeting-card', GreetingCard);

Greeting.register(host);
host.element.append(Greeting.create(host));
```

The same registered component can be rendered by a binding using its element
name, for example `<greeting-card />` in React, Preact, or Solid. Component
definitions only use `HostElement` APIs, so they do not depend on a framework.

Use `append`, `prepend`, `replaceChildren`, and `remove` to compose a tree. The
existing `host.insertBefore` and other low-level methods remain available when
precise tree operations are needed.

Built-in interactive elements use the same shape:

```ts
const save = host.createElement('button', { label: 'Save' });
save.addEventListener('press', saveDocument);
host.element.append(save);
```

Base elements such as `button` are class-backed internally, so focus,
connection, keyboard, and rendering behavior stay in `@clack/ui` rather than
being reimplemented by each binding.

## Examples

Run the interactive design-system example from the repository root:

```sh
corepack pnpm --filter @examples/design-system start
```

It demonstrates composed inputs, buttons, status updates, and dialog actions
in a single terminal screen.

## Bindings

| binding                                 | version                                                                                                                    | changelog                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`@clack/ui-preact`](./packages/preact) | [![npm](https://img.shields.io/npm/v/@clack/ui-preact?style=for-the-badge)](https://www.npmx.dev/package/@clack/ui-preact) | [./packages/preact/CHANGELOG.md](./packages/preact/CHANGELOG.md) |

## Documentation

Visit our [official documentation][docs].

## Support

Having trouble? Get help in the official [Bombshell Discord][discord].

[docs]: https://bomb.sh/docs/ui
[discord]: https://bomb.sh/chat
