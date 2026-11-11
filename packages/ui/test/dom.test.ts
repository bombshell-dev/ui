/**
 * Local DOM coverage not provided by our enabled WPT cases.
 * These are independent tests, not adaptations of upstream WPT tests.
 * Sibling traversal lives here while Node-properties.html requires unsupported
 * HTML/XML document fixtures. Prefer WPT coverage when its dependencies are met.
 */
import { describe, expect, it } from 'vitest';
import { Document } from '../src/dom.ts';

describe('Node sibling properties outside WPT coverage', () => {
	it.each(['createElement', 'createTextNode', 'createComment'] as const)(
		'%s has no siblings when detached or an only child',
		(create) => {
			const document = new Document(() => {});
			const parent = document.documentElement;
			const node = document[create]('document');

			expect(node.previousSibling).toBeNull();
			expect(node.nextSibling).toBeNull();

			parent.appendChild(node);
			expect(node.previousSibling).toBeNull();
			expect(node.nextSibling).toBeNull();

			parent.removeChild(node);
			expect(node.previousSibling).toBeNull();
			expect(node.nextSibling).toBeNull();
		},
	);

	it('traverses immediate siblings including text and comments', () => {
		const document = new Document(() => {});
		const parent = document.documentElement;
		const first = parent.appendChild(document.createElement('document'));
		const text = parent.appendChild(document.createTextNode('text'));
		const comment = parent.appendChild(document.createComment('comment'));
		const last = parent.appendChild(document.createElement('document'));
		const nested = first.appendChild(document.createTextNode('nested'));

		expect(first.previousSibling).toBeNull();
		expect(first.nextSibling).toBe(text);
		expect(text.previousSibling).toBe(first);
		expect(text.nextSibling).toBe(comment);
		expect(comment.previousSibling).toBe(text);
		expect(comment.nextSibling).toBe(last);
		expect(last.previousSibling).toBe(comment);
		expect(last.nextSibling).toBeNull();
		expect(nested.previousSibling).toBeNull();
		expect(nested.nextSibling).toBeNull();
	});

	it('updates both directions when existing children are reordered', () => {
		const document = new Document(() => {});
		const parent = document.documentElement;
		const first = parent.appendChild(document.createElement('document'));
		const middle = parent.appendChild(document.createTextNode('middle'));
		const last = parent.appendChild(document.createComment('last'));

		parent.insertBefore(last, middle);
		expect(first.previousSibling).toBeNull();
		expect(first.nextSibling).toBe(last);
		expect(last.previousSibling).toBe(first);
		expect(last.nextSibling).toBe(middle);
		expect(middle.previousSibling).toBe(last);
		expect(middle.nextSibling).toBeNull();

		parent.appendChild(first);
		expect(last.previousSibling).toBeNull();
		expect(last.nextSibling).toBe(middle);
		expect(middle.previousSibling).toBe(last);
		expect(middle.nextSibling).toBe(first);
		expect(first.previousSibling).toBe(middle);
		expect(first.nextSibling).toBeNull();
	});

	it('updates both trees when a child is moved to a different parent', () => {
		const document = new Document(() => {});
		const source = document.createElement('document');
		const destination = document.createElement('document');
		const first = source.appendChild(document.createTextNode('first'));
		const moved = source.appendChild(document.createElement('document'));
		const last = source.appendChild(document.createComment('last'));
		const anchor = destination.appendChild(document.createTextNode('anchor'));

		destination.insertBefore(moved, anchor);
		expect(first.previousSibling).toBeNull();
		expect(first.nextSibling).toBe(last);
		expect(last.previousSibling).toBe(first);
		expect(last.nextSibling).toBeNull();
		expect(moved.previousSibling).toBeNull();
		expect(moved.nextSibling).toBe(anchor);
		expect(anchor.previousSibling).toBe(moved);
		expect(anchor.nextSibling).toBeNull();
	});

	it('closes the sibling gap on removal and clears detached relationships', () => {
		const document = new Document(() => {});
		const parent = document.documentElement;
		const first = parent.appendChild(document.createTextNode('first'));
		const middle = parent.appendChild(document.createComment('middle'));
		const last = parent.appendChild(document.createElement('document'));

		parent.removeChild(middle);
		expect(first.nextSibling).toBe(last);
		expect(last.previousSibling).toBe(first);
		expect(middle.previousSibling).toBeNull();
		expect(middle.nextSibling).toBeNull();

		parent.removeChild(first);
		expect(first.previousSibling).toBeNull();
		expect(first.nextSibling).toBeNull();
		expect(last.previousSibling).toBeNull();
		expect(last.nextSibling).toBeNull();
	});
});
