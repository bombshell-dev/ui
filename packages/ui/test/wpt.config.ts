import type { WPTConfig } from '@bomb.sh/web-platform-tests';
import { CharacterData, Comment, Document, Element, Node, Text } from '../src/dom.ts';

export default {
	globals: {
		CharacterData,
		Comment,
		Document,
		DOMException: globalThis.DOMException,
		Element,
		Node,
		Text,
	},
	include: {
		'dom/nodes/Document-createTextNode.html': true,
		'dom/nodes/Document-createElement.html': true,
		'dom/nodes/Document-createComment.html': true,
	},
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
