import type { WPTConfig } from '@bomb.sh/web-platform-tests';
import { Document, Element, Node, Text } from '../src/dom.ts';

export default {
	globals: { Document, Element, Node, Text },
	exclude: {
		'css/**': true,
		'custom-elements/**': true,
		'dom/**': true,
		'domparsing/**': true,
		'html/**': true,
		'inert/**': true,
		'input-events/**': true,
		'selection/**': true,
		'shadow-dom/**': true,
		'uievents/**': true,
		'xhr/**': true,
	},
} satisfies WPTConfig;
