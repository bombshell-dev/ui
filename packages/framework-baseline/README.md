# @bomb.sh/framework-baseline

Private tooling that records which DOM members each supported framework uses, then checks them against the [framework profiles](../web-platform-tests/src/frameworks/frameworks.ts) in `@bomb.sh/web-platform-tests`.

Each framework renders the same [scenario](src/scenario.ts) app into happy-dom: mount, events, keyed list updates, conditionals, class/style, `innerHTML`, form bindings, SVG, focus, and unmount. The [recorder](src/recorder.ts) wraps every DOM prototype member and keeps only accesses whose direct caller is framework code; happy-dom internals and the scenario itself are ignored. Production builds are recorded, without hydration.

```sh
pnpm --filter @bomb.sh/web-platform-tests build
pnpm --filter @bomb.sh/framework-baseline run check            # all frameworks
pnpm --filter @bomb.sh/framework-baseline run check react vue  # selected
pnpm --filter @bomb.sh/framework-baseline run check --json
```

The check fails when a framework uses a member whose feature is missing from its profile, or a member that has no feature at all. Add the feature to [`features.ts`](../web-platform-tests/src/frameworks/features.ts) with the WPT cases covering it, or an empty map when none are adapted yet. Required features the scenario never observes are reported for information only: frameworks rely on event propagation without calling `dispatchEvent`, and some paths, such as handler removal or hydration, are outside the scenario.

CI runs the check against the pinned versions on relevant changes and against the latest releases every Monday ([workflow](../../.github/workflows/framework-baseline.yml)).

Known recorder gaps:

- `style.color = …` assignments bypass happy-dom's prototype accessors and are not observed.
- happy-dom does not match `:checked` on `<option>`, so the Svelte driver binds its select manually and does not exercise Svelte's `bind:value` select path.
