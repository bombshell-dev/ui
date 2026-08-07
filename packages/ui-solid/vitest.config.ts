// oxlint-disable import/no-default-export -- Vitest loads configuration through a default export.
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const solid = fileURLToPath(new URL('./node_modules/solid-js/dist/solid.js', import.meta.url));
const universal = fileURLToPath(
	new URL('./node_modules/solid-js/universal/dist/universal.js', import.meta.url),
);

export default defineConfig({
	resolve: {
		alias: [
			{ find: 'solid-js/universal', replacement: universal },
			{ find: /^solid-js$/, replacement: solid },
		],
	},
	ssr: {
		noExternal: ['solid-js'],
	},
});
