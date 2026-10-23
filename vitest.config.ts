import shared from '@bomb.sh/tools/test-utils/vitest.config.mjs';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
	shared,
	defineConfig({
		resolve: {
			alias: [
				{
					find: /^@clack\/ui$/,
					replacement: fileURLToPath(new URL('./packages/ui/src/index.ts', import.meta.url)),
				},
				{
					find: /^@clack\/ui-preact$/,
					replacement: fileURLToPath(new URL('./packages/ui-preact/src/index.ts', import.meta.url)),
				},
				{
					find: /^@clack\/ui-preact\/jsx-runtime$/,
					replacement: fileURLToPath(
						new URL('./packages/ui-preact/src/jsx-runtime.ts', import.meta.url),
					),
				},
				{
					find: /^@clack\/ui-preact\/jsx-dev-runtime$/,
					replacement: fileURLToPath(
						new URL('./packages/ui-preact/src/jsx-dev-runtime.ts', import.meta.url),
					),
				},
			],
		},
		test: { exclude: ['**/dist/**', '**/node_modules/**'] },
	}),
);
