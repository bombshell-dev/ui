# Contributing to `@clack/ui`

Thanks for wanting to help! `@clack/ui` is still an early alpha, so APIs change and whole files get rewritten. If you're planning anything bigger than a small fix, open an issue or say hi on [Discord](https://bomb.sh/chat) first. That way nobody loses a weekend to code that's about to move.

## Get set up

Fork the repo, then clone your fork:

```sh
git clone https://github.com/<your-username>/ui.git
cd ui
```

You need the exact Node and pnpm versions listed under `devEngines` in the root `package.json`. This part is picky. The wrong Node stops `pnpm install` right away, and pnpm 11 fails on the `node-pty` build.

Any version manager works. If you use [mise](https://mise.jdx.dev), which is what our lint, format, and test checks use, export `MISE_IDIOMATIC_VERSION_FILE_ENABLE_TOOLS=node,pnpm` and run `mise install` so it reads those versions from `package.json`.

Then install the dependencies and build the packages:

```sh
pnpm install
pnpm build
```

## Commands you'll use

Run these from the repo root. Tests and benchmarks reuse the built WPT package.
Rebuild it after changing its sources with `pnpm --filter @bomb.sh/web-platform-tests build`;
you can run tests repeatedly without rebuilding otherwise.

| Command                                    | What it does                              |
| ------------------------------------------ | ----------------------------------------- |
| `pnpm test`                                | Runs every test                           |
| `pnpm test packages/ui/src/layout.test.ts` | Runs one test file                        |
| `pnpm lint`                                | Runs the linter                           |
| `pnpm format`                              | Formats the code                          |
| `pnpm format:check`                        | Checks the formatting and changes nothing |
| `pnpm build`                               | Builds the packages                       |
| `pnpm bench`                               | Runs the benchmarks                       |

The benchmarks take a few minutes, so you only need them for changes that could affect rendering speed.

## Find your way around

All the code lives in `packages/ui`.

- `src` has the runtime. Start with `createUI` in `src/ui.ts`.
- Tests sit next to the code as `*.test.ts`.
- `test` has the test helpers.
- `bench` has the benchmarks, and its README explains what they measure.

To test what ends up on the screen, use `createTestUI` from `test/ui.ts`. It runs the UI against a fake terminal in the same process, so you can read the screen, type, and press keys:

```ts
await using ui = await createTestUI({ cols: 12, rows: 2 });

ui.document.documentElement.appendChild(ui.document.createTextNode('hello'));

await expect.poll(() => ui.terminal.screen.getLines()).toEqual(['hello', '']);
```

Use `expect.poll` here, because the screen doesn't update the moment you change the document.

## Open a pull request

Before you push, make sure these pass:

```sh
pnpm build
pnpm lint
pnpm format:check
pnpm test
```

CI runs these checks on every pull request, building the WPT package once before tests or benchmarks. A separate workflow publishes a preview build. In your PR, tell us why the change is needed and link the issue if there is one.

## Be kind

Everyone here follows the [Bombshell code of conduct](https://github.com/bombshell-dev/.github/blob/main/CODE_OF_CONDUCT.md). By contributing, you agree that your work is licensed under the [MIT license](./LICENSE).

Stuck on something? Come ask on [Discord](https://bomb.sh/chat).
