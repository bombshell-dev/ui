import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('For an empty Element, textContent should be the empty string', ({ document }) => {
		let element = document.createElement('div');
		expect(element.textContent).toBe('');
	});
	context.test(
		'For an empty DocumentFragment, textContent should be the empty string',
		({ document }) => {
			expect(document.createDocumentFragment().textContent).toBe('');
		},
	);
	context.test('Element with children', ({ document }) => {
		let el = document.createElement('div');
		el.appendChild(document.createComment(' abc '));
		el.appendChild(document.createTextNode('\tDEF\t'));
		el.appendChild(document.createProcessingInstruction('x', ' ghi '));
		expect(el.textContent).toBe('\tDEF\t');
	});
	context.test('Element with descendants', ({ document }) => {
		let el = document.createElement('div');
		let child = document.createElement('div');
		el.appendChild(child);
		child.appendChild(document.createComment(' abc '));
		child.appendChild(document.createTextNode('\tDEF\t'));
		child.appendChild(document.createProcessingInstruction('x', ' ghi '));
		expect(el.textContent).toBe('\tDEF\t');
	});
	context.test('DocumentFragment with children', ({ document }) => {
		let df = document.createDocumentFragment();
		df.appendChild(document.createComment(' abc '));
		df.appendChild(document.createTextNode('\tDEF\t'));
		df.appendChild(document.createProcessingInstruction('x', ' ghi '));
		expect(df.textContent).toBe('\tDEF\t');
	});
	context.test('DocumentFragment with descendants', ({ document }) => {
		let df = document.createDocumentFragment();
		let child = document.createElement('div');
		df.appendChild(child);
		child.appendChild(document.createComment(' abc '));
		child.appendChild(document.createTextNode('\tDEF\t'));
		child.appendChild(document.createProcessingInstruction('x', ' ghi '));
		expect(df.textContent).toBe('\tDEF\t');
	});
	context.test('For an empty Text, textContent should be the empty string', ({ document }) => {
		expect(document.createTextNode('').textContent).toBe('');
	});
	context.test(
		'For an empty ProcessingInstruction, textContent should be the empty string',
		({ document }) => {
			expect(document.createProcessingInstruction('x', '').textContent).toBe('');
		},
	);
	context.test('For an empty Comment, textContent should be the empty string', ({ document }) => {
		expect(document.createComment('').textContent).toBe('');
	});
	context.test('For a Text with data, textContent should be that data', ({ document }) => {
		expect(document.createTextNode('abc').textContent).toBe('abc');
	});
	context.test(
		'For a ProcessingInstruction with data, textContent should be that data',
		({ document }) => {
			expect(document.createProcessingInstruction('x', 'abc').textContent).toBe('abc');
		},
	);
	context.test('For a Comment with data, textContent should be that data', ({ document }) => {
		expect(document.createComment('abc').textContent).toBe('abc');
	});
	context.test('For a Text, textContent should set the data', ({ document }) => {
		let text = document.createTextNode('abc');
		text.textContent = 'def';
		expect(text.textContent).toBe('def');
		expect(text.data).toBe('def');
	});
	context.test('For a ProcessingInstruction, textContent should set the data', ({ document }) => {
		let pi = document.createProcessingInstruction('x', 'abc');
		pi.textContent = 'def';
		expect(pi.textContent).toBe('def');
		expect(pi.data).toBe('def');
		expect(pi.target).toBe('x');
	});
	context.test('For a Comment, textContent should set the data', ({ document }) => {
		let comment = document.createComment('abc');
		comment.textContent = 'def';
		expect(comment.textContent).toBe('def');
		expect(comment.data).toBe('def');
	});
	for (const [creator, create] of [
		['parser', (document: Document) => document],
		[
			'createDocument',
			(document: Document) => document.implementation.createDocument('', 'test', null),
		],
		[
			'createHTMLDocument',
			(document: Document) => document.implementation.createHTMLDocument('title'),
		],
	] as const) {
		context.test(
			'For Documents created by ' + creator + ', textContent should be null',
			({ document }) => {
				const doc = create(document);

				expect(doc.textContent).toBe(null);
			},
		);
		context.test(
			'For Documents created by ' + creator + ', setting textContent should do nothing',
			({ document }) => {
				const doc = create(document);

				let root = doc.documentElement;
				(doc as Node).textContent = 'a';
				expect(doc.textContent).toBe(null);
				expect(doc.documentElement).toBe(root);
			},
		);
	}
	for (const [creator, create] of [
		['parser', (document: Document) => document.doctype!],
		['script', (document: Document) => document.implementation.createDocumentType('x', '', '')],
	] as const) {
		context.test(
			'For DocumentType created by ' + creator + ', textContent should be null',
			({ document }) => {
				const doctype = create(document);

				expect(doctype.textContent).toBe(null);
			},
		);
		context.test(
			'For DocumentType created by ' + creator + ', setting textContent should do nothing',
			({ document }) => {
				const doctype = create(document);

				let props = {
					name: doctype.name,
					publicId: doctype.publicId,
					systemId: doctype.systemId,
				};
				(doctype as Node).textContent = 'b';
				expect(doctype.textContent).toBe(null);
				expect(doctype.name, 'name should not change').toBe(props.name);
				expect(doctype.publicId, 'publicId should not change').toBe(props.publicId);
				expect(doctype.systemId, 'systemId should not change').toBe(props.systemId);
			},
		);
	}
	for (const [argument, expectation] of [
		[null, null],
		[undefined, null],
		['', null],
		[42, '42'],
		['abc', 'abc'],
		['<b>xyz</b>', '<b>xyz</b>'],
		['d\0e', 'd\0e'],
	] as const) {
		context.test('Element without children set to ' + String(argument), ({ document, Text }) => {
			const check = (aElementOrDocumentFragment: Element | DocumentFragment) => {
				if (expectation === null) {
					expect(aElementOrDocumentFragment.textContent).toBe('');
					expect(aElementOrDocumentFragment.firstChild).toBe(null);
				} else {
					expect(aElementOrDocumentFragment.textContent).toBe(expectation);
					expect(aElementOrDocumentFragment.childNodes.length, 'Should have one child').toBe(1);
					let firstChild = aElementOrDocumentFragment.firstChild as Text;
					expect(firstChild instanceof Text, 'child should be a Text').toBe(true);
					expect(firstChild.data).toBe(expectation);
				}
			};

			let el = document.createElement('div');
			el.textContent = argument as unknown as string;
			check(el);
		});
		context.test(
			'Element with empty text node as child set to ' + String(argument),
			({ document, Text }) => {
				const check = (aElementOrDocumentFragment: Element | DocumentFragment) => {
					if (expectation === null) {
						expect(aElementOrDocumentFragment.textContent).toBe('');
						expect(aElementOrDocumentFragment.firstChild).toBe(null);
					} else {
						expect(aElementOrDocumentFragment.textContent).toBe(expectation);
						expect(aElementOrDocumentFragment.childNodes.length, 'Should have one child').toBe(1);
						let firstChild = aElementOrDocumentFragment.firstChild as Text;
						expect(firstChild instanceof Text, 'child should be a Text').toBe(true);
						expect(firstChild.data).toBe(expectation);
					}
				};

				let el = document.createElement('div');
				let text = el.appendChild(document.createTextNode(''));
				el.textContent = argument as unknown as string;
				check(el);
				expect(text.parentNode, 'Preexisting Text should have been removed').toBe(null);
			},
		);
		context.test('Element with children set to ' + String(argument), ({ document, Text }) => {
			const check = (aElementOrDocumentFragment: Element | DocumentFragment) => {
				if (expectation === null) {
					expect(aElementOrDocumentFragment.textContent).toBe('');
					expect(aElementOrDocumentFragment.firstChild).toBe(null);
				} else {
					expect(aElementOrDocumentFragment.textContent).toBe(expectation);
					expect(aElementOrDocumentFragment.childNodes.length, 'Should have one child').toBe(1);
					let firstChild = aElementOrDocumentFragment.firstChild as Text;
					expect(firstChild instanceof Text, 'child should be a Text').toBe(true);
					expect(firstChild.data).toBe(expectation);
				}
			};

			let el = document.createElement('div');
			el.appendChild(document.createComment(' abc '));
			el.appendChild(document.createTextNode('\tDEF\t'));
			el.appendChild(document.createProcessingInstruction('x', ' ghi '));
			el.textContent = argument as unknown as string;
			check(el);
		});
		context.test('Element with descendants set to ' + String(argument), ({ document, Text }) => {
			const check = (aElementOrDocumentFragment: Element | DocumentFragment) => {
				if (expectation === null) {
					expect(aElementOrDocumentFragment.textContent).toBe('');
					expect(aElementOrDocumentFragment.firstChild).toBe(null);
				} else {
					expect(aElementOrDocumentFragment.textContent).toBe(expectation);
					expect(aElementOrDocumentFragment.childNodes.length, 'Should have one child').toBe(1);
					let firstChild = aElementOrDocumentFragment.firstChild as Text;
					expect(firstChild instanceof Text, 'child should be a Text').toBe(true);
					expect(firstChild.data).toBe(expectation);
				}
			};

			let el = document.createElement('div');
			let child = document.createElement('div');
			el.appendChild(child);
			child.appendChild(document.createComment(' abc '));
			child.appendChild(document.createTextNode('\tDEF\t'));
			child.appendChild(document.createProcessingInstruction('x', ' ghi '));
			el.textContent = argument as unknown as string;
			check(el);
			expect(
				child.childNodes.length,
				'Should not have changed the internal structure of the removed nodes.',
			).toBe(3);
		});
		context.test(
			'DocumentFragment without children set to ' + String(argument),
			({ document, Text }) => {
				const check = (aElementOrDocumentFragment: Element | DocumentFragment) => {
					if (expectation === null) {
						expect(aElementOrDocumentFragment.textContent).toBe('');
						expect(aElementOrDocumentFragment.firstChild).toBe(null);
					} else {
						expect(aElementOrDocumentFragment.textContent).toBe(expectation);
						expect(aElementOrDocumentFragment.childNodes.length, 'Should have one child').toBe(1);
						let firstChild = aElementOrDocumentFragment.firstChild as Text;
						expect(firstChild instanceof Text, 'child should be a Text').toBe(true);
						expect(firstChild.data).toBe(expectation);
					}
				};

				let df = document.createDocumentFragment();
				df.textContent = argument as unknown as string;
				check(df);
			},
		);
		context.test(
			'DocumentFragment with empty text node as child set to ' + String(argument),
			({ document, Text }) => {
				const check = (aElementOrDocumentFragment: Element | DocumentFragment) => {
					if (expectation === null) {
						expect(aElementOrDocumentFragment.textContent).toBe('');
						expect(aElementOrDocumentFragment.firstChild).toBe(null);
					} else {
						expect(aElementOrDocumentFragment.textContent).toBe(expectation);
						expect(aElementOrDocumentFragment.childNodes.length, 'Should have one child').toBe(1);
						let firstChild = aElementOrDocumentFragment.firstChild as Text;
						expect(firstChild instanceof Text, 'child should be a Text').toBe(true);
						expect(firstChild.data).toBe(expectation);
					}
				};

				let df = document.createDocumentFragment();
				let text = df.appendChild(document.createTextNode(''));
				df.textContent = argument as unknown as string;
				check(df);
				expect(text.parentNode, 'Preexisting Text should have been removed').toBe(null);
			},
		);
		context.test(
			'DocumentFragment with children set to ' + String(argument),
			({ document, Text }) => {
				const check = (aElementOrDocumentFragment: Element | DocumentFragment) => {
					if (expectation === null) {
						expect(aElementOrDocumentFragment.textContent).toBe('');
						expect(aElementOrDocumentFragment.firstChild).toBe(null);
					} else {
						expect(aElementOrDocumentFragment.textContent).toBe(expectation);
						expect(aElementOrDocumentFragment.childNodes.length, 'Should have one child').toBe(1);
						let firstChild = aElementOrDocumentFragment.firstChild as Text;
						expect(firstChild instanceof Text, 'child should be a Text').toBe(true);
						expect(firstChild.data).toBe(expectation);
					}
				};

				let df = document.createDocumentFragment();
				df.appendChild(document.createComment(' abc '));
				df.appendChild(document.createTextNode('\tDEF\t'));
				df.appendChild(document.createProcessingInstruction('x', ' ghi '));
				df.textContent = argument as unknown as string;
				check(df);
			},
		);
		context.test(
			'DocumentFragment with descendants set to ' + String(argument),
			({ document, Text }) => {
				const check = (aElementOrDocumentFragment: Element | DocumentFragment) => {
					if (expectation === null) {
						expect(aElementOrDocumentFragment.textContent).toBe('');
						expect(aElementOrDocumentFragment.firstChild).toBe(null);
					} else {
						expect(aElementOrDocumentFragment.textContent).toBe(expectation);
						expect(aElementOrDocumentFragment.childNodes.length, 'Should have one child').toBe(1);
						let firstChild = aElementOrDocumentFragment.firstChild as Text;
						expect(firstChild instanceof Text, 'child should be a Text').toBe(true);
						expect(firstChild.data).toBe(expectation);
					}
				};

				let df = document.createDocumentFragment();
				let child = document.createElement('div');
				df.appendChild(child);
				child.appendChild(document.createComment(' abc '));
				child.appendChild(document.createTextNode('\tDEF\t'));
				child.appendChild(document.createProcessingInstruction('x', ' ghi '));
				df.textContent = argument as unknown as string;
				check(df);
				expect(
					child.childNodes.length,
					'Should not have changed the internal structure of the removed nodes.',
				).toBe(3);
			},
		);
	}
}
