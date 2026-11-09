export const testRanges = [
	'[paras[0].firstChild, 0, paras[0].firstChild, 0]',
	'[paras[0].firstChild, 0, paras[0].firstChild, 1]',
	'[paras[0].firstChild, 2, paras[0].firstChild, 8]',
	'[paras[0].firstChild, 2, paras[0].firstChild, 9]',
	'[paras[1].firstChild, 0, paras[1].firstChild, 0]',
	'[paras[1].firstChild, 0, paras[1].firstChild, 1]',
	'[paras[1].firstChild, 2, paras[1].firstChild, 8]',
	'[paras[1].firstChild, 2, paras[1].firstChild, 9]',
	'[detachedPara1.firstChild, 0, detachedPara1.firstChild, 0]',
	'[detachedPara1.firstChild, 0, detachedPara1.firstChild, 1]',
	'[detachedPara1.firstChild, 2, detachedPara1.firstChild, 8]',
	'[foreignPara1.firstChild, 0, foreignPara1.firstChild, 0]',
	'[foreignPara1.firstChild, 0, foreignPara1.firstChild, 1]',
	'[foreignPara1.firstChild, 2, foreignPara1.firstChild, 8]',
	'[document.documentElement, 0, document.documentElement, 1]',
	'[document.documentElement, 0, document.documentElement, 2]',
	'[document.documentElement, 1, document.documentElement, 2]',
	'[document.head, 1, document.head, 1]',
	'[document.body, 0, document.body, 1]',
	'[foreignDoc.documentElement, 0, foreignDoc.documentElement, 1]',
	'[foreignDoc.head, 1, foreignDoc.head, 1]',
	'[foreignDoc.body, 0, foreignDoc.body, 0]',
	'[paras[0], 0, paras[0], 0]',
	'[paras[0], 0, paras[0], 1]',
	'[detachedPara1, 0, detachedPara1, 0]',
	'[detachedPara1, 0, detachedPara1, 1]',
	'[paras[0].firstChild, 0, paras[1].firstChild, 0]',
	'[paras[0].firstChild, 0, paras[1].firstChild, 8]',
	'[paras[0].firstChild, 3, paras[3], 1]',
	'[paras[0], 0, paras[0].firstChild, 7]',
	'[testDiv, 2, paras[4], 1]',
	'[testDiv, 1, paras[2].firstChild, 5]',
	'[document.documentElement, 1, document.body, 0]',
	'[foreignDoc.documentElement, 1, foreignDoc.body, 0]',
	'[document, 0, document, 1]',
	'[document, 0, document, 2]',
	'[document, 1, document, 2]',
	'[testDiv, 0, comment, 5]',
	'[paras[2].firstChild, 4, comment, 2]',
	'[paras[3], 1, comment, 8]',
	'[foreignDoc, 0, foreignDoc, 0]',
	'[foreignDoc, 1, foreignComment, 2]',
	'[foreignDoc.body, 0, foreignTextNode, 36]',
	'[xmlDoc, 0, xmlDoc, 0]',
	'[xmlDoc, 1, xmlComment, 0]',
	'[detachedTextNode, 0, detachedTextNode, 8]',
	'[detachedForeignTextNode, 7, detachedForeignTextNode, 7]',
	'[detachedForeignTextNode, 0, detachedForeignTextNode, 8]',
	'[detachedXmlTextNode, 7, detachedXmlTextNode, 7]',
	'[detachedXmlTextNode, 0, detachedXmlTextNode, 8]',
	'[detachedComment, 3, detachedComment, 4]',
	'[detachedComment, 5, detachedComment, 5]',
	'[detachedForeignComment, 0, detachedForeignComment, 1]',
	'[detachedForeignComment, 4, detachedForeignComment, 4]',
	'[detachedXmlComment, 2, detachedXmlComment, 6]',
	'[docfrag, 0, docfrag, 0]',
	'[foreignDocfrag, 0, foreignDocfrag, 0]',
	'[xmlDocfrag, 0, xmlDocfrag, 0]',
] as const;
type Endpoints = [Node, number, Node, number];
export function setupRangeTests(document: Document): Endpoints[] {
	let testDiv = document.querySelector('#test');
	if (testDiv) {
		testDiv.parentNode!.removeChild(testDiv);
	}
	testDiv = document.createElement('div');
	testDiv.id = 'test';
	document.body.insertBefore(testDiv, document.body.firstChild);
	// Test some diacritics, to make sure browsers are using code units here
	// and not something like grapheme clusters.
	testDiv.innerHTML =
		'<p id=a>A&#x308;b&#x308;c&#x308;d&#x308;e&#x308;f&#x308;g&#x308;h&#x308;\n' +
		'<p id=b style=display:none>Ijklmnop\n' +
		'<p id=c>Qrstuvwx' +
		'<p id=d style=display:none>Yzabcdef' +
		'<p id=e style=display:none>Ghijklmn';
	let paras = testDiv.querySelectorAll('p');

	let detachedDiv = document.createElement('div');
	let detachedPara1 = document.createElement('p');
	detachedPara1.appendChild(document.createTextNode('Opqrstuv'));
	let detachedPara2 = document.createElement('p');
	detachedPara2.appendChild(document.createTextNode('Wxyzabcd'));
	detachedDiv.appendChild(detachedPara1);
	detachedDiv.appendChild(detachedPara2);

	// Opera doesn't automatically create a doctype for a new HTML document,
	// contrary to spec.  It also doesn't let you add doctypes to documents
	// after the fact through any means I've tried.  So foreignDoc in Opera
	// will have no doctype, foreignDoctype will be null, and Opera will fail
	// some tests somewhat mysteriously as a result.
	let foreignDoc = document.implementation.createHTMLDocument('');
	let foreignPara1 = foreignDoc.createElement('p');
	foreignPara1.appendChild(foreignDoc.createTextNode('Efghijkl'));
	let foreignPara2 = foreignDoc.createElement('p');
	foreignPara2.appendChild(foreignDoc.createTextNode('Mnopqrst'));
	foreignDoc.body.appendChild(foreignPara1);
	foreignDoc.body.appendChild(foreignPara2);

	// Now we get to do really silly stuff, which nobody in the universe is
	// ever going to actually do, but the spec defines behavior, so too bad.
	// Testing is fun!
	let xmlDoctype = document.implementation.createDocumentType('qorflesnorf', 'abcde', 'x"\'y');
	let xmlDoc = document.implementation.createDocument(null, null as unknown as string, xmlDoctype);
	let detachedXmlElement = xmlDoc.createElement('everyone-hates-hyphenated-element-names');
	let detachedTextNode = document.createTextNode('Uvwxyzab');
	let detachedForeignTextNode = foreignDoc.createTextNode('Cdefghij');
	let detachedXmlTextNode = xmlDoc.createTextNode('Klmnopqr');
	// PIs only exist in XML documents, so don't bother with document or
	// foreignDoc.
	let detachedProcessingInstruction = xmlDoc.createProcessingInstruction(
		'whippoorwill',
		'chirp chirp chirp',
	);
	let detachedComment = document.createComment('Stuvwxyz');
	// Hurrah, we finally got to "z" at the end!
	let detachedForeignComment = foreignDoc.createComment('אריה יהודה');
	let detachedXmlComment = xmlDoc.createComment('בן חיים אליעזר');

	// We should also test with document fragments that actually contain stuff
	// . . . but, maybe later.
	let docfrag = document.createDocumentFragment();
	let foreignDocfrag = foreignDoc.createDocumentFragment();
	let xmlDocfrag = xmlDoc.createDocumentFragment();

	let xmlElement = xmlDoc.createElement('igiveuponcreativenames');
	let xmlTextNode = xmlDoc.createTextNode('do re mi fa so la ti');
	xmlElement.appendChild(xmlTextNode);
	let processingInstruction = xmlDoc.createProcessingInstruction(
		'somePI',
		'Did you know that ":syn sync fromstart" is very useful when using vim to edit large amounts of JavaScript embedded in HTML?',
	);
	xmlDoc.appendChild(xmlElement);
	xmlDoc.appendChild(processingInstruction);
	let xmlComment = xmlDoc.createComment(
		'I maliciously created a comment that will break incautious XML serializers, but Firefox threw an exception, so all I got was this lousy T-shirt',
	);
	xmlDoc.appendChild(xmlComment);

	let comment = document.createComment('Alphabet soup?');
	testDiv.appendChild(comment);

	let foreignComment = foreignDoc.createComment(
		'"Commenter" and "commentator" mean different things.  I\'ve seen non-native speakers trip up on this.',
	);
	foreignDoc.appendChild(foreignComment);
	let foreignTextNode = foreignDoc.createTextNode(
		"I admit that I harbor doubts about whether we really need so many things to test, but it's too late to stop now.",
	);
	foreignDoc.body.appendChild(foreignTextNode);

	let doctype = document.doctype;
	let foreignDoctype = foreignDoc.doctype;

	return [
		[paras[0]!.firstChild!, 0, paras[0]!.firstChild!, 0],
		[paras[0]!.firstChild!, 0, paras[0]!.firstChild!, 1],
		[paras[0]!.firstChild!, 2, paras[0]!.firstChild!, 8],
		[paras[0]!.firstChild!, 2, paras[0]!.firstChild!, 9],
		[paras[1]!.firstChild!, 0, paras[1]!.firstChild!, 0],
		[paras[1]!.firstChild!, 0, paras[1]!.firstChild!, 1],
		[paras[1]!.firstChild!, 2, paras[1]!.firstChild!, 8],
		[paras[1]!.firstChild!, 2, paras[1]!.firstChild!, 9],
		[detachedPara1.firstChild!, 0, detachedPara1.firstChild!, 0],
		[detachedPara1.firstChild!, 0, detachedPara1.firstChild!, 1],
		[detachedPara1.firstChild!, 2, detachedPara1.firstChild!, 8],
		[foreignPara1.firstChild!, 0, foreignPara1.firstChild!, 0],
		[foreignPara1.firstChild!, 0, foreignPara1.firstChild!, 1],
		[foreignPara1.firstChild!, 2, foreignPara1.firstChild!, 8],
		[document.documentElement, 0, document.documentElement, 1],
		[document.documentElement, 0, document.documentElement, 2],
		[document.documentElement, 1, document.documentElement, 2],
		[document.head, 1, document.head, 1],
		[document.body, 0, document.body, 1],
		[foreignDoc.documentElement, 0, foreignDoc.documentElement, 1],
		[foreignDoc.head, 1, foreignDoc.head, 1],
		[foreignDoc.body, 0, foreignDoc.body, 0],
		[paras[0]!, 0, paras[0]!, 0],
		[paras[0]!, 0, paras[0]!, 1],
		[detachedPara1, 0, detachedPara1, 0],
		[detachedPara1, 0, detachedPara1, 1],
		[paras[0]!.firstChild!, 0, paras[1]!.firstChild!, 0],
		[paras[0]!.firstChild!, 0, paras[1]!.firstChild!, 8],
		[paras[0]!.firstChild!, 3, paras[3]!, 1],
		[paras[0]!, 0, paras[0]!.firstChild!, 7],
		[testDiv, 2, paras[4]!, 1],
		[testDiv, 1, paras[2]!.firstChild!, 5],
		[document.documentElement, 1, document.body, 0],
		[foreignDoc.documentElement, 1, foreignDoc.body, 0],
		[document, 0, document, 1],
		[document, 0, document, 2],
		[document, 1, document, 2],
		[testDiv, 0, comment, 5],
		[paras[2]!.firstChild!, 4, comment, 2],
		[paras[3]!, 1, comment, 8],
		[foreignDoc, 0, foreignDoc, 0],
		[foreignDoc, 1, foreignComment, 2],
		[foreignDoc.body, 0, foreignTextNode, 36],
		[xmlDoc, 0, xmlDoc, 0],
		[xmlDoc, 1, xmlComment, 0],
		[detachedTextNode, 0, detachedTextNode, 8],
		[detachedForeignTextNode, 7, detachedForeignTextNode, 7],
		[detachedForeignTextNode, 0, detachedForeignTextNode, 8],
		[detachedXmlTextNode, 7, detachedXmlTextNode, 7],
		[detachedXmlTextNode, 0, detachedXmlTextNode, 8],
		[detachedComment, 3, detachedComment, 4],
		[detachedComment, 5, detachedComment, 5],
		[detachedForeignComment, 0, detachedForeignComment, 1],
		[detachedForeignComment, 4, detachedForeignComment, 4],
		[detachedXmlComment, 2, detachedXmlComment, 6],
		[docfrag, 0, docfrag, 0],
		[foreignDocfrag, 0, foreignDocfrag, 0],
		[xmlDocfrag, 0, xmlDocfrag, 0],
	] as Endpoints[];
}
export function ownerDocument(node: Node): Document {
	return node.nodeType === 9 ? (node as Document) : node.ownerDocument!;
}
