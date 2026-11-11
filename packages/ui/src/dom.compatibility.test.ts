import { describe, it, expect } from 'vitest';
import { testDOMCompatibility } from '@bomb.sh/web-platform-tests';
import { Document } from './dom.ts';
import config from '../test/wpt.config.ts';

testDOMCompatibility({
	runner: { describe, it, expect },
	config,
	create: () => new Document(() => {}),
});
