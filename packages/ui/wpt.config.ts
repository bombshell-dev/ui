import type { WPTConfig } from '@bomb.sh/web-platform-tests/config';
import { createHTMLDocument } from './src/dom.ts';
import adapted from './test/wpt.config.ts';

/** Initial raw-source checkpoint; the adapted suite remains the coverage baseline. */
const config: WPTConfig = {
	createDocument: () => createHTMLDocument(() => {}),
	globals: { ...adapted.globals },
	include: {
		'dom/nodes/Node-parentNode.html': ['Document', 'Root element'],
		'dom/nodes/Document-createElementNS.html': [
			/^createElementNS test in HTML document:/,
			/^(Lower|Upper)-case /,
			'null namespace',
			'undefined namespace',
			'empty string namespace',
		],
	},
	exclude: { '**': true },
};

export default config;
