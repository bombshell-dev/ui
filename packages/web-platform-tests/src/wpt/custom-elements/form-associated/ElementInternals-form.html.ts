import type { CompatibilityContext } from '../../../shared/context.ts';

const markup = `<!DOCTYPE html>
<title>form attribute of ElementInternals</title>
<body>



<script>
customElements.define('custom-input-parser', class extends HTMLElement {
  static get formAssociated() { return true; }

  constructor() {
    super();
    this.internals_ = this.attachInternals();
  }
  get i() { return this.internals_; }
});
</script>

<form id="custom-form">
  <custom-input-parser id="custom-1"></custom-input-parser>
  <custom-input-upgrade id="custom-2"></custom-input-upgrade>
</form>
<custom-input-parser id="custom-3" form="custom-form"></custom-input-parser>
<custom-input-upgrade id="custom-4" form="custom-form"></custom-input-upgrade>
<custom-input-upgrade id="custom-5"></custom-input-upgrade>

`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"ElementInternals.form should return the target element's form owner",
		({ document, HTMLElement, customElements }) => {
			const form = document.forms[0];
			expect(
				(document.getElementById('custom-1') as HTMLElement & { i: ElementInternals }).i.form,
			).toBe(form);
			expect(
				(document.getElementById('custom-3') as HTMLElement & { i: ElementInternals }).i.form,
			).toBe(form);

			// Test upgrading.
			customElements.define(
				'custom-input-upgrade',
				class extends HTMLElement {
					static get formAssociated() {
						return true;
					}
					declare internals_: ElementInternals;
					constructor() {
						super();
						this.internals_ = this.attachInternals();
					}
					get i() {
						return this.internals_;
					}
				},
			);
			expect(
				(document.getElementById('custom-2') as HTMLElement & { i: ElementInternals }).i.form,
			).toBe(form);
			expect(
				(document.getElementById('custom-4') as HTMLElement & { i: ElementInternals }).i.form,
			).toBe(form);

			// Test changing name attribuate.
			let custom5 = document.getElementById('custom-5') as HTMLElement & { i: ElementInternals };
			expect(custom5.i.form).toBe(null);
			custom5.setAttribute('form', 'custom-form');
			expect(custom5.i.form).toBe(form);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'ElementInternals.form should throws NotSupportedError if the target element is not a form-associated custom element',
		({ HTMLElement, customElements, DOMException }) => {
			class NotFormAssociatedElement extends HTMLElement {}
			customElements.define('not-form-associated-element', NotFormAssociatedElement);
			const element = new NotFormAssociatedElement();
			const i = element.attachInternals();
			expect(() => i.form).toThrow(
				expect.objectContaining({
					name: 'NotSupportedError',
					code: 9,
					constructor: DOMException,
				}),
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
