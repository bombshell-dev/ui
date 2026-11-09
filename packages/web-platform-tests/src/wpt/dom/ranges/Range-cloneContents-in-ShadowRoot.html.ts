import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function innerHTMLOfDocumentFragment(document: Document, docFlag: DocumentFragment) {
		const div = document.createElement('div');
		div.appendChild(docFlag.cloneNode(true));
		return div.innerHTML;
	}

	context.test(
		'Range.cloneContents() when "<div><shadow-root>{}</shadow-root></div>"',
		({ document, cleanup }) => {
			const caseName = 'Range.cloneContents() when "<div><shadow-root>{}</shadow-root></div>"';

			const host = document.createElement('div');
			cleanup(() => host.remove());
			const shadowRoot = host.attachShadow({ mode: 'open' });
			const range = document.createRange();
			range.setStart(shadowRoot, 0);
			let docFlag;
			try {
				docFlag = range.cloneContents();
			} catch (e) {
				expect(false, `${caseName}: range.cloneContents() shouldn't throw exception: ${e}`).toBe(
					true,
				);
			}
			expect(
				innerHTMLOfDocumentFragment(document, docFlag!),
				`${caseName}: range.cloneContents() should return empty DocumentFragment`,
			).toBe('');
		},
	);
	context.test(
		'Range.cloneContents() when "<div><shadow-root>{<span>ABC</span>}</shadow-root></div>"',
		({ document, cleanup }) => {
			const caseName =
				'Range.cloneContents() when "<div><shadow-root>{<span>ABC</span>}</shadow-root></div>"';

			const host = document.createElement('div');
			cleanup(() => host.remove());
			const shadowRoot = host.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = '<span>ABC</span>';
			const range = document.createRange();
			range.setStart(shadowRoot, 0);
			range.setEnd(shadowRoot, 1);
			let docFlag;
			try {
				docFlag = range.cloneContents();
			} catch (e) {
				expect(false, `${caseName}: range.cloneContents() shouldn't throw exception: ${e}`).toBe(
					true,
				);
			}
			expect(
				innerHTMLOfDocumentFragment(document, docFlag!),
				`${
					caseName
				}: range.cloneContents() should return a DocumentFragment which contains the clone of the selected element in the ShadowRoot`,
			).toBe('<span>ABC</span>');
		},
	);
	context.test(
		'Range.cloneContents() when "<div><shadow-root>{<span>ABC</span>}<span>DEF</span></shadow-root></div>"',
		({ document, cleanup }) => {
			const caseName =
				'Range.cloneContents() when "<div><shadow-root>{<span>ABC</span>}<span>DEF</span></shadow-root></div>"';

			const host = document.createElement('div');
			cleanup(() => host.remove());
			const shadowRoot = host.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = '<span>ABC</span><span>DEF</span>';
			const range = document.createRange();
			range.setStart(shadowRoot, 0);
			range.setEnd(shadowRoot, 1);
			let docFlag;
			try {
				docFlag = range.cloneContents();
			} catch (e) {
				expect(false, `${caseName}: range.cloneContents() shouldn't throw exception: ${e}`).toBe(
					true,
				);
			}
			expect(
				innerHTMLOfDocumentFragment(document, docFlag!),
				`${
					caseName
				}: range.cloneContents() should return a DocumentFragment which contains the clone of the selected element in the ShadowRoot`,
			).toBe('<span>ABC</span>');
		},
	);
	context.test(
		'Range.cloneContents() when "<div><shadow-root><span>ABC</span>{<span>DEF</span>}</shadow-root></div>"',
		({ document, cleanup }) => {
			const caseName =
				'Range.cloneContents() when "<div><shadow-root><span>ABC</span>{<span>DEF</span>}</shadow-root></div>"';

			const host = document.createElement('div');
			cleanup(() => host.remove());
			const shadowRoot = host.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = '<span>ABC</span><span>DEF</span>';
			const range = document.createRange();
			range.setStart(shadowRoot, 1);
			range.setEnd(shadowRoot, 2);
			let docFlag;
			try {
				docFlag = range.cloneContents();
			} catch (e) {
				expect(false, `${caseName}: range.cloneContents() shouldn't throw exception: ${e}`).toBe(
					true,
				);
			}
			expect(
				innerHTMLOfDocumentFragment(document, docFlag!),
				`${
					caseName
				}: range.cloneContents() should return a DocumentFragment which contains the clone of the selected element in the ShadowRoot`,
			).toBe('<span>DEF</span>');
		},
	);
}
