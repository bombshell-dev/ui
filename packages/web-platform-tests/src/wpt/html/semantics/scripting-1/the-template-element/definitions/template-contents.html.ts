import type { CompatibilityContext } from '../../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('The template contents must be a DocumentFragment (empty template)', (fixture) => {
		const { document } = fixture;
		function newHTMLDocument() {
			return document.implementation.createHTMLDocument('Test Document');
		}
		const Node = fixture.Node;

		let doc = newHTMLDocument();
		let template = doc.createElement('template');

		doc.body.appendChild(template);

		expect(template.content.nodeType, 'Template content should be a DocumentFragment').toBe(
			Node.DOCUMENT_FRAGMENT_NODE,
		);

		expect(
			Object.prototype.toString.call(template.content),
			'Template content class should be a DocumentFragment',
		).toBe('[object DocumentFragment]');
	});
	context.test(
		'The template contents must be a DocumentFragment (non empty template)',
		(fixture) => {
			const { document } = fixture;
			function newHTMLDocument() {
				return document.implementation.createHTMLDocument('Test Document');
			}
			const Node = fixture.Node;

			let doc = newHTMLDocument();
			let template = doc.createElement('template');

			template.innerHTML = '<div>This is a div</div><span>This is a span</span>';

			doc.body.appendChild(template);

			expect(template.content.nodeType, 'Template content should be a DocumentFragment').toBe(
				Node.DOCUMENT_FRAGMENT_NODE,
			);

			expect(
				Object.prototype.toString.call(template.content),
				'Template content class should be a DocumentFragment',
			).toBe('[object DocumentFragment]');
		},
	);
	context.test(
		'The template contents must be a DocumentFragment (non empty template ' +
			'containing div which is an Element instance)',
		(fixture) => {
			const { document } = fixture;
			function newHTMLDocument() {
				return document.implementation.createHTMLDocument('Test Document');
			}
			const Node = fixture.Node;

			let doc = newHTMLDocument();
			let template = doc.createElement('template');

			template.innerHTML = '<div>This is a div</div>';

			doc.body.appendChild(template);

			expect(template.content.nodeType, 'Template content should be a documentFragment').toBe(
				Node.DOCUMENT_FRAGMENT_NODE,
			);
		},
	);
	context.test(
		'The template contents must be a DocumentFragment (not empty template ' +
			'containing text node)',
		(fixture) => {
			const { document } = fixture;
			function newHTMLDocument() {
				return document.implementation.createHTMLDocument('Test Document');
			}
			const Node = fixture.Node;

			let doc = newHTMLDocument();
			let template = doc.createElement('template');

			template.innerHTML = 'Some text';

			doc.body.appendChild(template);

			expect(template.content.nodeType, 'Template content should be a documentFragment').toBe(
				Node.DOCUMENT_FRAGMENT_NODE,
			);

			expect(
				Object.prototype.toString.call(template.content),
				'Template content class should be a DocumentFragment',
			).toBe('[object DocumentFragment]');
		},
	);
	context.test(
		'The template contents must be a DocumentFragment (nested template ' +
			'containing a text node)',
		(fixture) => {
			const { document } = fixture;
			function newHTMLDocument() {
				return document.implementation.createHTMLDocument('Test Document');
			}
			const Node = fixture.Node;

			let doc = newHTMLDocument();
			let template = doc.createElement('template');

			template.innerHTML = '<template id="t2">Some text</template>';

			doc.body.appendChild(template);

			expect(template.content.nodeType, 'Template content should be a documentFragment').toBe(
				Node.DOCUMENT_FRAGMENT_NODE,
			);
			expect(
				Object.prototype.toString.call(template.content),
				'Template content class should be a DocumentFragment',
			).toBe('[object DocumentFragment]');

			let nestedTemplate = template.content.querySelector<HTMLTemplateElement>('#t2')!;
			expect(
				nestedTemplate.content.nodeType,
				'Nested template content should be a documentFragment',
			).toBe(Node.DOCUMENT_FRAGMENT_NODE);

			expect(
				Object.prototype.toString.call(nestedTemplate.content),
				'Nested template content class should be a DocumentFragment',
			).toBe('[object DocumentFragment]');
		},
	);
}
