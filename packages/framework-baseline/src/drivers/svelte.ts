import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { flushSync, mount, unmount } from 'svelte';
import type { Driver, Props } from '../scenario.ts';
import { COMPILED_DIR } from '../recorder.ts';

// No type declarations are published for this subpath; resolved via `require` (typed `any`) to
// avoid TS7016 ("could not find a declaration file") since it's only reachable via the "default"
// export condition. Node's ESM `require` support (stable since v22) makes this safe at runtime.
const { proxy } = createRequire(import.meta.url)('svelte/internal/client') as {
	proxy: <T extends object>(value: T) => T;
};

/** Runes-mode component matching the markup documented on `Driver`/`App` in scenario.ts. */
const source = `
<script>
	let { items, show, className, color, html, radius, listen } = $props();

	let count = $state(0);
	let pings = $state(0);
	let text = $state('');
	let area = $state('');
	let checked = $state(false);
	let choice = $state('a');
</script>

<div id="app" class={className} style="color: {color}">
	<button id="inc" onclick={() => count++}>{count}</button>
	<button id="ping" onclick={listen ? () => pings++ : undefined}>{pings}</button>
	<ul>{#each items as item (item)}<li>{item}</li>{/each}</ul>
	{#if show}<p id="cond">shown</p>{/if}
	<div id="html">{@html html}</div>
	<input id="text" bind:value={text} />
	<span id="echo">{text}</span>
	<textarea id="area" bind:value={area}></textarea>
	<span id="area-echo">{area}</span>
	<input id="check" type="checkbox" bind:checked={checked} />
	<span id="check-echo">{checked ? 'on' : 'off'}</span>
	<select id="choice" value={choice} onchange={(event) => (choice = event.currentTarget.value)}>
		<option value="a">A</option>
		<option value="b">B</option>
	</select>
	<span id="choice-echo">{choice}</span>
	<svg><circle r={radius}></circle></svg>
</div>
`;

const { js } = compile(source, {
	filename: 'App.svelte',
	generate: 'client',
	dev: false,
});

mkdirSync(COMPILED_DIR, { recursive: true });
const outFile = `${COMPILED_DIR}App.js`;
writeFileSync(outFile, js.code);

// `.compiled/` lives inside packages/framework-baseline, so node_modules resolution for the
// compiled module's `svelte/internal/client` import still finds this package's node_modules.
const { default: App } = await import(pathToFileURL(outFile).href);

export const driver: Driver = {
	async mount(container, initial) {
		// A plain object wouldn't notify the component on mutation; `proxy()` is the same
		// reactive wrapper `$state({ ... })` produces, which is what `mount`'s `props` expects
		// when the caller intends to keep mutating it after mount.
		const reactive = proxy({ ...initial });
		const instance = mount(App, { target: container, props: reactive });
		return {
			async update(next: Props) {
				Object.assign(reactive, next);
				flushSync();
			},
			async flush() {
				flushSync();
			},
			async unmount() {
				await unmount(instance);
			},
		};
	},
};
