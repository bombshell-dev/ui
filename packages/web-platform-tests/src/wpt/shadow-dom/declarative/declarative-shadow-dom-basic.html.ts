import type { CompatibilityContext } from '../../../shared/context.ts';

const markup = `<!DOCTYPE html>
<meta charset="utf-8">
<title>Declarative Shadow DOM</title>





<div id="host" style="display:none">
  <template shadowrootmode="open">
    <slot id="s1" name="slot1"></slot>
  </template>
  <div id="c1" slot="slot1"></div>
</div>



<div id="multi-host" style="display:none">
  <template shadowrootmode="open">
    <span>root 1</span>
  </template>
  <template shadowrootmode="closed">
    <span>root 2</span>
  </template>
</div>


<template id="template-containing-shadow">
  <div class="innerdiv">
    <template shadowrootmode=open shadowrootclonable>Content</template>
  </div>
</template>


<template id="template-containing-deep-shadow">
  <div><div><div><div><div>
    <div class="innerdiv">
      <template shadowrootmode=open shadowrootclonable>Content</template>
    </div>
  </div></div></div></div></div>
</template>


<template id="template-containing-template">
  <div>
    <template id="inner-template">
      <div class="innerdiv">
        <template shadowrootmode=open shadowrootclonable>Content</template>
      </div>
    </template>
  </div>
</template>


<template id="template-containing-ua-shadow">
  <div class="innerdiv">
    <template shadowrootmode=open shadowrootclonable>
      <video></video> <!--Assumed to have UA shadow root-->
    </template>
  </div>
</template>


<template id="template-containing-ua-shadow-closed">
  <div class="innerdiv">
    <template shadowrootmode=closed>
      <video></video> <!--Assumed to have UA shadow root-->
    </template>
  </div>
</template>


<template id="root-element-shadow">
    <template shadowrootmode=open>Content</template>
</template>



<progress id="invalid-element-exception">
  <template shadowrootmode=open>Content</template>
</progress>

`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Declarative Shadow DOM: Basic test',
		({ document }) => {
			const host = document.querySelector('#host')!;
			const c1 = host.querySelector('#c1')!;
			expect(!!c1).toBe(true);
			expect(host.querySelector<HTMLSlotElement>('#s1')!, 'Should be inside shadow root').toBe(
				null,
			);
			expect(host.querySelector('template')!, 'No leftover template node').toBe(null);
			expect(!!host.shadowRoot!, 'No shadow root found').toBe(true);
			const s1 = host.shadowRoot!.querySelector<HTMLSlotElement>('#s1')!;
			expect(c1.assignedSlot).toBe(s1);
			{
				const actual = s1.assignedNodes();
				const expected = [c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: Feature detection',
		({ HTMLTemplateElement }) => {
			expect(
				HTMLTemplateElement.prototype.hasOwnProperty('shadowRootMode'),
				'Unable to feature detect',
			).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Shadowrootmode reflection',
		({ document }) => {
			const t = document.createElement('template');
			t.setAttribute('shadowrootmode', 'open');
			expect(t.shadowRootMode, 'The shadowRootMode IDL should reflect the content attribute').toBe(
				'open',
			);
			t.setAttribute('shadowrootmode', 'closed');
			expect(t.shadowRootMode, '"open" and "closed" should both be valid values').toBe('closed');
			t.setAttribute('shadowrootmode', 'OpEn');
			expect(t.shadowRootMode, 'Case insensitive').toBe('open');
			t.setAttribute('shadowrootmode', 'INVALID');
			expect(t.shadowRootMode, 'Invalid values map to empty string').toBe('');
			t.removeAttribute('shadowrootmode');
			expect(t.shadowRootMode, 'No shadowrootmode attribute maps to empty string').toBe('');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Shadowrootmode reflection, setter',
		({ document }) => {
			const t = document.createElement('template');
			t.shadowRootMode = 'blah';
			expect(t.shadowRootMode).toBe('');
			(t.getAttribute as (...args: string[]) => string | null)('shadowrootmode', 'blah');
			t.shadowRootMode = 'CLOSED';
			expect(t.shadowRootMode).toBe('closed');
			(t.getAttribute as (...args: string[]) => string | null)('shadowrootmode', 'CLOSED');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Shadowrootdelegatesfocus reflection',
		({ document }) => {
			const t = document.createElement('template');
			t.setAttribute('shadowrootdelegatesfocus', '');
			expect(
				t.shadowRootDelegatesFocus,
				'The shadowRootDelegatesFocus IDL should reflect the content attribute',
			).toBe(true);
			t.setAttribute('shadowrootdelegatesfocus', 'foobar');
			expect(t.shadowRootDelegatesFocus, "The value doesn't matter").toBe(true);
			t.removeAttribute('shadowrootdelegatesfocus');
			expect(
				t.shadowRootDelegatesFocus,
				'No shadowRootDelegatesFocus attribute maps to false',
			).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Shadowrootdelegatesfocus reflection, setter',
		({ document }) => {
			const t = document.createElement('template');
			expect(t.getAttribute('shadowrootdelegatesfocus')).toBe(null);
			t.shadowRootDelegatesFocus = true;
			expect(t.getAttribute('shadowrootdelegatesfocus')).toBe('');
			expect(t.shadowRootDelegatesFocus).toBe(true);
			t.shadowRootDelegatesFocus = false;
			expect(t.getAttribute('shadowrootdelegatesfocus')).toBe(null);
			expect(t.shadowRootDelegatesFocus).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Shadowrootclonable reflection',
		({ document }) => {
			const t = document.createElement('template');
			t.setAttribute('shadowrootclonable', '');
			expect(
				t.shadowRootClonable,
				'The shadowRootClonable IDL should reflect the content attribute',
			).toBe(true);
			t.setAttribute('shadowrootclonable', 'foobar');
			expect(t.shadowRootClonable, "The value doesn't matter").toBe(true);
			t.removeAttribute('shadowrootclonable');
			expect(t.shadowRootClonable, 'No shadowRootClonable attribute maps to false').toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Shadowrootclonable reflection, setter',
		({ document }) => {
			const t = document.createElement('template');
			expect(t.getAttribute('shadowrootclonable')).toBe(null);
			t.shadowRootClonable = true;
			expect(t.getAttribute('shadowrootclonable')).toBe('');
			expect(t.shadowRootClonable).toBe(true);
			t.shadowRootClonable = false;
			expect(t.getAttribute('shadowrootclonable')).toBe(null);
			expect(t.shadowRootClonable).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: Fragment parser basic test',
		({ document }) => {
			const div = document.createElement('div');
			div.setHTMLUnsafe(`
    <div id="host">
      <template shadowrootmode="open">
        <slot id="s1" name="slot1"></slot>
      </template>
      <div id="c1" slot="slot1"></div>
    </div>
    `);
			const host = div.querySelector('#host')!;
			const c1 = host.querySelector('#c1')!;
			expect(!!c1).toBe(true);
			expect(host.querySelector<HTMLSlotElement>('#s1')!, 'Should be inside shadow root').toBe(
				null,
			);
			expect(host.querySelector('template')!, 'No leftover template node').toBe(null);
			expect(!!host.shadowRoot!, 'No shadow root found').toBe(true);
			const s1 = host.shadowRoot!.querySelector<HTMLSlotElement>('#s1')!;
			expect(c1.assignedSlot).toBe(s1);
			{
				const actual = s1.assignedNodes();
				const expected = [c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: Invalid shadow root attribute',
		({ document }) => {
			const div = document.createElement('div');
			div.setHTMLUnsafe(`
    <div id="host">
      <template shadowrootmode="invalid">
      </template>
    </div>
    `);
			const host = div.querySelector('#host')!;
			expect(host.shadowRoot!, 'Shadow root was found').toBe(null);
			const tmpl = host.querySelector('template')!;
			expect(!!tmpl, 'Template should still be present').toBe(true);
			const shadowrootAttr = tmpl.getAttribute('shadowrootmode');
			expect(shadowrootAttr, "'shadowrootmode' attribute should still be present").toBe('invalid');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: Closed shadow root attribute',
		({ document }) => {
			const div = document.createElement('div');
			div.setHTMLUnsafe(`
    <div id="host">
      <template shadowrootmode="closed">
      </template>
    </div>
    `);
			const host = div.querySelector('#host')!;
			expect(host.shadowRoot!, 'Closed shadow root').toBe(null);
			expect(host.querySelector('template')!, 'No template - converted to shadow root').toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: Missing closing tag',
		({ document }) => {
			const div = document.createElement('div');
			div.setHTMLUnsafe(`
    <div id="host">
      <template shadowrootmode="open">
        <slot id="s1" name="slot1"></slot>
    </div>
    `);
			const host = div.querySelector('#host')!;
			expect(host.querySelector<HTMLSlotElement>('#s1')!, 'Should be inside shadow root').toBe(
				null,
			);
			expect(host.querySelector('template')!, 'No leftover template node').toBe(null);
			expect(!!host.shadowRoot!, 'No shadow root found').toBe(true);
			const s1 = host.shadowRoot!.querySelector<HTMLSlotElement>('#s1')!;
			expect(!!s1, 'Slot should be inside the shadow root').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: delegates focus attribute',
		({ document }) => {
			const div = document.createElement('div');
			div.setHTMLUnsafe(`
    <div id="host">
      <template shadowrootmode="open" shadowrootdelegatesfocus>
      </template>
    </div>
    `);
			var host = div.querySelector('#host')!;
			expect(!!host.shadowRoot!, 'No shadow root found').toBe(true);
			expect(host.shadowRoot!.delegatesFocus, 'delegatesFocus should be true').toBe(true);
			div.setHTMLUnsafe(`
    <div id="host">
      <template shadowrootmode="open">
      </template>
    </div>
    `);
			host = div.querySelector('#host')!;
			expect(!!host.shadowRoot!, 'No shadow root found').toBe(true);
			expect(
				host.shadowRoot!.delegatesFocus,
				'delegatesFocus should be false without the shadowrootdelegatesfocus attribute',
			).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: clonable attribute',
		({ document }) => {
			const div = document.createElement('div');
			div.setHTMLUnsafe(`
    <div id="host">
      <template shadowrootmode="open" shadowrootclonable>
      </template>
    </div>
    `);
			var host = div.querySelector('#host')!;
			expect(!!host.shadowRoot!, 'No shadow root found').toBe(true);
			expect(host.shadowRoot!.clonable, 'clonable should be true').toBe(true);
			div.setHTMLUnsafe(`
    <div id="host">
      <template shadowrootmode="open">
      </template>
    </div>
    `);
			host = div.querySelector('#host')!;
			expect(!!host.shadowRoot!, 'No shadow root found').toBe(true);
			expect(
				host.shadowRoot!.clonable,
				'clonable should be false without the shadowrootclonable attribute',
			).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: Multiple roots',
		({ document, HTMLTemplateElement }) => {
			const host = document.querySelector('#multi-host')!;
			const leftover = host.querySelector('template')!;
			expect(!!leftover, 'The second (duplicate) template should be left in the DOM').toBe(true);
			expect(leftover instanceof HTMLTemplateElement).toBe(true);
			expect(leftover.getAttribute('shadowrootmode')).toBe('closed');
			expect(leftover.shadowRootMode).toBe('closed');
			expect(!!host.shadowRoot!, 'No open shadow root found - first root should remain').toBe(true);
			const innerSpan = host.shadowRoot!.querySelector('span')!;
			expect(innerSpan.textContent, 'Content should come from first declarative shadow root').toBe(
				'root 1',
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: template containing declarative shadow root (with shadowrootclonable)',
		({ document }) => {
			const template = document.querySelector<HTMLTemplateElement>('#template-containing-shadow')!;
			const container1 = document.createElement('div');
			container1.style.display = 'none';
			document.body.appendChild(container1);
			container1.appendChild(template.content.cloneNode(true));
			let innerDiv = container1.querySelector('div.innerdiv')!;
			const shadowRoot1 = innerDiv.shadowRoot!;
			expect(!!shadowRoot1, 'Inner div should have a shadow root').toBe(true);
			expect(innerDiv.querySelector('template')!, 'No leftover template node').toBe(null);

			const container2 = document.createElement('div');
			container2.style.display = 'none';
			document.body.appendChild(container2);
			container2.appendChild(template.content.cloneNode(true));
			innerDiv = container2.querySelector('div.innerdiv')!;
			const shadowRoot2 = innerDiv.shadowRoot!;
			expect(!!shadowRoot2, 'Inner div should have a shadow root').toBe(true);
			expect(innerDiv.querySelector('template')!, 'No leftover template node').toBe(null);

			expect(shadowRoot1, 'Should not get back the same shadow root').not.toBe(shadowRoot2);

			// Make sure importNode also works.
			const container3 = document.createElement('div');
			container3.style.display = 'none';
			document.body.appendChild(container3);
			container3.appendChild(document.importNode(template.content, true));
			innerDiv = container3.querySelector('div.innerdiv')!;
			const shadowRoot3 = innerDiv.shadowRoot!;
			expect(!!shadowRoot3, 'Inner div should have a shadow root').toBe(true);
			expect(innerDiv.querySelector('template')!, 'No leftover template node').toBe(null);
			expect(shadowRoot1, 'Should not get back the same shadow root').not.toBe(shadowRoot3);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: template containing (deeply nested) declarative shadow root',
		({ document }) => {
			const template = document.querySelector<HTMLTemplateElement>(
				'#template-containing-deep-shadow',
			)!;
			const host = document.createElement('div');
			host.style.display = 'none';
			document.body.appendChild(host);
			host.appendChild(template.content.cloneNode(true));
			expect(
				!!host.querySelector('div.innerdiv')!.shadowRoot!,
				'Inner div should have a shadow root',
			).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: template containing a template containing declarative shadow root',
		({ document }) => {
			const template = document.querySelector<HTMLTemplateElement>(
				'#template-containing-template',
			)!;
			const host = document.createElement('div');
			host.style.display = 'none';
			document.body.appendChild(host);
			host.appendChild(template.content.cloneNode(true));
			const innerTemplate = host.querySelector<HTMLTemplateElement>('#inner-template')!;
			expect(
				!!innerTemplate.content.querySelector('div.innerdiv')!.shadowRoot!,
				'Inner div should have a shadow root',
			).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: template containing declarative shadow root and UA shadow root',
		({ document }) => {
			const template = document.querySelector<HTMLTemplateElement>(
				'#template-containing-ua-shadow',
			)!;
			const host = document.createElement('div');
			host.style.display = 'none';
			document.body.appendChild(host);
			// Mostly make sure clone of template *does* clone the
			// shadow root, and doesn't crash on cloning the <video>.
			host.appendChild(template.content.cloneNode(true));
			let innerDiv = host.querySelector('div.innerdiv')!;
			const shadowRoot = innerDiv.shadowRoot!;
			expect(!!shadowRoot, 'Inner div should have a shadow root').toBe(true);
			expect(innerDiv.querySelector('template')!, 'No leftover template node').toBe(null);
			expect(
				!!innerDiv.shadowRoot!.querySelector('video')!,
				'Video element should be present',
			).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: template containing closed declarative shadow root and UA shadow root',
		({ document }) => {
			const template = document.querySelector<HTMLTemplateElement>(
				'#template-containing-ua-shadow-closed',
			)!;
			const host = document.createElement('div');
			host.style.display = 'none';
			document.body.appendChild(host);
			host.appendChild(template.content.cloneNode(true));
			let innerDiv = host.querySelector('div.innerdiv')!;
			expect(!innerDiv.shadowRoot!, 'Inner div should have a closed shadow root').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Declarative Shadow DOM: declarative shadow roots are not supported by the template element',
		({ document }) => {
			// Root element of this template is a <template shadowroot>:
			const template = document.querySelector<HTMLTemplateElement>('#root-element-shadow')!;
			const host = document.createElement('div');
			host.appendChild(template.content.cloneNode(true));
			expect(host.shadowRoot!, 'Shadow root should not be present').toBe(null);
			const tmpl = host.querySelector('template')!;
			expect(!!tmpl, 'Template should still be present').toBe(true);
			expect(
				tmpl.getAttribute('shadowrootmode'),
				"'shadowrootmode' attribute should still be present",
			).toBe('open');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
