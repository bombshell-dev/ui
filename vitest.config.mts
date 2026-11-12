import codspeedPlugin from '@codspeed/vitest-plugin';
import base from '@bomb.sh/tools/test-utils/vitest.config.mjs';
import { defineConfig, mergeConfig } from 'vitest/config';
import { wptNameFilter } from '@bomb.sh/web-platform-tests/vitest';

export default mergeConfig(
	base,
	defineConfig({
		plugins: [codspeedPlugin(), wptNameFilter()],
		test: {
			benchmark: { include: ['**/*.bench.ts'] },
			experimental: { viteModuleRunner: false },
			// ensure we running only one test at a time
			maxWorkers: 1,
			isolate: false,
		},
	}),
);
