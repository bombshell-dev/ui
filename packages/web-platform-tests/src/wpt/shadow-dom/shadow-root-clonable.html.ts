import type { CompatibilityContext } from '../../shared/context.ts';

const markup2 = `<!DOCTYPE html>
<title>Shadow root clonable flag</title>







<body>


<template id="test">
  <div id="host">
    <template shadowrootmode=open><input></template>
  </div>
</template>


`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'attachShadow with clonable: true',
		({ document }) => {
			const div = document.createElement('div');
			const root = div.attachShadow({ mode: 'open', clonable: true });
			root.innerHTML = '<input><div><span></span></div>';
			expect(root.clonable, 'clonable attribute').toBe(true);

			const clone = div.cloneNode(true) as Element;
			const clonedRoot = clone.shadowRoot!;
			expect(clonedRoot.clonable, 'clone gets the same clonable state').toBe(true);
			expect(clonedRoot.children.length, 'children count').toBe(2);
			expect(clonedRoot.children[0]!.localName, 'children content').toBe('input');
			expect(clonedRoot.children[1]!.firstElementChild!.localName, 'grandchildren content').toBe(
				'span',
			);

			const shallowClone = div.cloneNode(false) as Element;
			const shallowClonedRoot = shallowClone.shadowRoot!;
			expect(shallowClonedRoot.clonable, 'clone gets the same clonable state').toBe(true);
			expect(
				shallowClonedRoot.children.length,
				'shallow clone still deep-clones the shadow root',
			).toBe(2);
			expect(shallowClonedRoot.children[0]!.localName, 'shadow children content').toBe('input');
			expect(
				shallowClonedRoot.children[1]!.firstElementChild!.localName,
				'shadow grandchildren content',
			).toBe('span');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	for (const clonable of [false, undefined]) {
		context.test(
			`attachShadow with clonable: ${clonable}`,
			({ document }) => {
				const div = document.createElement('div');
				const root = div.attachShadow({ mode: 'open', clonable } as ShadowRootInit);
				root.appendChild(document.createElement('input'));
				expect(root.clonable, 'clonable attribute').toBe(false);

				const clone = div.cloneNode(true) as Element;
				expect(!clone.shadowRoot!, 'shadow should not be cloned').toBe(true);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup2,
				},
			},
		);
	}
	context.test(
		'declarative shadow roots do *not* get clonable: true automatically',
		({ document }) => {
			const div = document.createElement('div');
			div.setHTMLUnsafe('<div><template shadowrootmode=open><input></template></div>');
			const root = div.firstElementChild!.shadowRoot!;
			expect(!!root).toBe(true);
			expect(
				root.clonable,
				'clonable is *not* automatically true for declarative shadow root',
			).toBe(false);

			const clone = div.cloneNode(true) as Element;
			const clonedRoot = clone.firstElementChild!.shadowRoot!;
			expect(!clonedRoot, 'no shadow root gets cloned').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	context.test(
		'declarative shadow roots can opt in to clonable with shadowrootclonable',
		({ document }) => {
			const div = document.createElement('div');
			div.setHTMLUnsafe(
				'<div><template shadowrootmode=open shadowrootclonable><input></template></div>',
			);
			const root = div.firstElementChild!.shadowRoot!;
			expect(!!root).toBe(true);
			expect(root.clonable, 'clonable gets added when shadowrootclonable is present').toBe(true);

			const clone = div.cloneNode(true) as Element;
			const clonedRoot = clone.firstElementChild!.shadowRoot!;
			expect(!!clonedRoot).toBe(true);
			expect(clonedRoot.children.length, 'children count').toBe(1);
			expect(clonedRoot.children[0]!.localName, 'children content').toBe('input');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	context.test(
		'declarative shadow roots inside templates do *not* get cloned automatically',
		({ document }) => {
			const template = document.querySelector<HTMLTemplateElement>('#test')!;
			const root = template.content.querySelector('#host')!.shadowRoot!;
			expect(!!root).toBe(true);
			const clone = template.content.cloneNode(true) as DocumentFragment;
			const clonedRoot = clone.querySelector('#host')!.shadowRoot!;
			expect(!clonedRoot, 'no shadow root gets cloned').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
}
