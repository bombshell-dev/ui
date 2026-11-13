# Basic example

A DOM version of the original basic panel, using `div`, `span`, text nodes, and
direct `element.style` assignments.

From the repository root:

```sh
pnpm install
pnpm build
pnpm --filter @examples/basic start
```

The panel appears in the terminal's alternate screen while the example runs.
Press Enter or Ctrl+C to finish and restore the previous screen:

```text
┌──────────────────────┐
│ @clack/ui            │
│                      │
│ status  ● ready      │
│ version 0.0.0        │
│ render  @bomb.sh/tty │
└──────────────────────┘
```

The title is cyan, labels are gray, status is green, remaining values inherit
white from the panel, and borders are blue. Each label and value is a separate
`span` in a flex row; this does not need mixed-color runs inside one text flow.

Borders occupy their own cells in the CSS box model, so the panel has one cell
of horizontal padding and zero vertical padding. Together with its one-cell
border, this preserves the original example's 24-column, 7-row appearance.

The tests render the same `createApp()` tree through the UI source, checking
layout and colors. Run them with:

```sh
pnpm test examples/basic/src/app.test.ts
```
