import type { CompatibilityContext } from '../../../shared/context.ts';
import { testGetElementsByTagName } from './Document-Element-getElementsByTagName.js.ts';

export function register(context: CompatibilityContext): void {
	testGetElementsByTagName(context, {
		setup: (document) => ({ root: document, element: document.body }),
		document: {
			contentType: 'text/html',
			content: `<!DOCTYPE html>
<meta charset=utf-8>
<title>Document.getElementsByTagName</title>
<link rel=help href="https://dom.spec.whatwg.org/#dom-document-getelementsbytagname">
<div id="log"></div>`,
		},
	});
}
