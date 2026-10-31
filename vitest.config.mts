import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [codspeedPlugin()],
	test: {
		benchmark: { include: ['**/*.bench.ts'] },
		experimental: { viteModuleRunner: false },
		// ensure we running only one test at a time
		maxWorkers: 1,
		isolate: false,
	},
});
