// Adapted from WPT inert-node-is-unfocusable.html and inert-in-shadow-dom.html at
// b719612f963a05ece9c89a7dd7598c1c59618874. Copyright web-platform-tests contributors;
// Alice Boxhall. BSD-3-Clause; see ../../../test/wpt/LICENSE and ../../../docs/wpt-state-styles.md.
import type { CompatibilityContext } from '../context.ts';
import type { DOMElement } from '../contracts/nodes.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/inert/inert-node-is-unfocusable.html';
export const requires = [
	'focus.eligibility',
	'focus.transitions',
	'events.dispatch.capture',
	'element.selectors',
	'element.attributes',
	'parsing.fragments',
] as const;
/** Registers inertness reflection and focus restrictions across trees. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'reflects explicit inertness without reflecting ancestor inertness on descendants',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const parent = document.createElement('div'),
				child = document.createElement('button');
			parent.append(child);
			expect(parent.inert).toBe(false);
			parent.inert = true;
			expect(parent.hasAttribute('inert')).toBe(true);
			expect(child.inert).toBe(false);
			parent.removeAttribute('inert');
			expect(parent.inert).toBe(false);
			parent.setAttribute('inert', 'false');
			expect(parent.inert).toBe(true);
			parent.inert = false;
			expect(parent.hasAttribute('inert')).toBe(false);
		},
	);
	context.test(
		'blocks focus and focus events throughout an inert subtree and restores eligibility',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const root = document.createElement('div');
			root.innerHTML =
				'<button id="outside">Outside</button><section inert><button>Button</button><input><textarea></textarea><a href="#">Link</a><span tabindex="0">Span</span></section>';
			fixture.connect(root as unknown as DOMElement);
			const outside = root.querySelector<HTMLButtonElement>('#outside')!,
				parent = root.querySelector('section')!;
			outside.focus();
			let events = 0;
			parent.addEventListener('focus', () => events++, true);
			const children = Array.from(parent.children) as HTMLElement[];
			for (const child of children) {
				child.focus();
				expect(document.activeElement).toBe(outside);
			}
			expect(events).toBe(0);
			parent.inert = false;
			for (const child of children) {
				child.focus();
				expect(document.activeElement).toBe(child);
			}
			expect(events).toBe(children.length);
		},
	);
	context.test(
		'a nested inert attribute continues blocking focus when its ancestor is cleared',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const parent = document.createElement('div'),
				child = document.createElement('button'),
				outside = document.createElement('button');
			parent.inert = true;
			child.inert = true;
			parent.append(child);
			fixture.connect(parent as unknown as DOMElement);
			fixture.connect(outside as unknown as DOMElement);
			outside.focus();
			parent.inert = false;
			child.focus();
			expect(document.activeElement).toBe(outside);
			child.inert = false;
			child.focus();
			expect(document.activeElement).toBe(child);
		},
	);
	context.test(
		'inertness does not make a control match disabled',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const button = document.createElement('button');
			button.inert = true;
			expect(button.matches(':disabled')).toBe(false);
			expect(button.matches(':enabled')).toBe(true);
			button.disabled = true;
			expect(button.matches(':disabled')).toBe(true);
		},
		['element.selectors'],
	);
	for (const mode of ['open', 'closed'] as const) {
		context.test(
			`inert host blocks both slotted and ${mode} shadow descendants`,
			(fixture) => {
				const document = fixture.document as unknown as Document;
				const host = document.createElement('div'),
					outside = document.createElement('button'),
					slotted = document.createElement('button'),
					internal = document.createElement('button');
				const shadow = host.attachShadow({ mode });
				shadow.append(document.createElement('slot'), internal);
				host.append(slotted);
				host.inert = true;
				fixture.connect(host as unknown as DOMElement);
				fixture.connect(outside as unknown as DOMElement);
				outside.focus();
				for (const target of [slotted, internal]) {
					target.focus();
					expect(document.activeElement).toBe(outside);
					expect(shadow.activeElement).toBeNull();
				}
				host.inert = false;
				slotted.focus();
				expect(document.activeElement).toBe(slotted);
				internal.focus();
				expect(document.activeElement).toBe(host);
				expect(shadow.activeElement).toBe(internal);
			},
			['shadow.slots.named', 'shadow.focus.retargeting'],
		);
	}
}
