import { describe, it, expect } from 'vitest';
import { testDOMCompatibility } from '@bomb.sh/web-platform-tests';
import { Document, Element, Node, Text } from './dom.ts';
import { domFeatures } from '../test/dom-features.ts';

testDOMCompatibility({
	runner: { describe, it, expect },
	features: domFeatures,
	create: () => new Document(() => {}),
	globals: { Document, Element, Node, Text },
});
