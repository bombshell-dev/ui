import codspeedPlugin from '@codspeed/vitest-plugin';
import { createRequire } from 'node:module';
import { configDefaults, defineConfig } from 'vitest/config';

const toolsRequire = createRequire(import.meta.resolve('@bomb.sh/tools/package.json'));
const ansiSerializer = toolsRequire.resolve('vitest-ansi-serializer');

export default defineConfig({
	plugins: [codspeedPlugin()],
	test: {
		exclude: [...configDefaults.exclude, 'dist/**'],
		projects: [
			{ test: { name: 'unit' } },
			{
				test: {
					name: 'bench',
					benchmark: { enabled: true, include: ['**/*.bench.ts'] },
					experimental: { viteModuleRunner: false },
				},
			},
		],
		// ensure we running only one test at a time
		maxWorkers: 1,
		isolate: false,
		testTimeout: 15_000,
		env: { FORCE_COLOR: '1' },
		snapshotSerializers: [ansiSerializer],
	},
});
