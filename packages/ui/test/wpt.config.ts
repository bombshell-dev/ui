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
		'dom/nodes/CharacterData-data.html': true,
		'dom/nodes/Node-nodeValue.html': ['Text.nodeValue', 'Comment.nodeValue'],
		'dom/nodes/Node-textContent.html': [
			'For an empty Text, textContent should be the empty string',
			'For an empty Comment, textContent should be the empty string',
			'For a Text with data, textContent should be that data',
			'For a Comment with data, textContent should be that data',
			'For a Text, textContent should set the data',
			'For a Comment, textContent should set the data',
		],
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
