import { testDOMCompatibility } from '@bomb.sh/web-platform-tests/vitest/runner';
import { Document } from './dom.ts';
import config from '../test/wpt.config.ts';

testDOMCompatibility({
	config,
	create: () => new Document(() => {}),
});
