import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#dom-nonelementparentnode-getelementbyid';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'finds connected IDs in tree order and reflects removals',
		({ document, connect }) => {
			const parent = document.createElement('div');
			connect(parent);
			const first = document.createElement('span');
			const second = document.createElement('span');
			first.id = 'compat-lookup';
			second.id = first.id;
			parent.appendChild(first);
			parent.appendChild(second);
			expect(document.getElementById(first.id)).toBe(first);
			first.remove();
			expect(document.getElementById(second.id)).toBe(second);
			second.remove();
			expect(document.getElementById('compat-lookup')).toBeNull();
		},
	);

	context.test(
		'returns first duplicate id in current tree order and excludes detached nodes',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const p = document.createElement('div'),
				a = document.createElement('i'),
				b = document.createElement('b');
			a.id = b.id = 'duplicate';
			p.append(a, b);
			fixture.connect(p as unknown as DOMElementContract);
			expect(document.getElementById('duplicate')).toBe(a);
			p.insertBefore(b, a);
			expect(document.getElementById('duplicate')).toBe(b);
			b.remove();
			expect(document.getElementById('duplicate')).toBe(a);
			a.remove();
			expect(document.getElementById('duplicate')).toBeNull();
			expect(document.getElementById('')).toBeNull();
		},
	);
}
