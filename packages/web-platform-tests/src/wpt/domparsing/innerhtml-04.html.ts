import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('innerHTML should leave the removed children alone.', ({ document }) => {
		function testIsChild(p: Node, c: Node) {
			expect(p.firstChild).toBe(c);
			expect(c.parentNode).toBe(p);
		}

		var p = document.createElement('p');
		var b = p.appendChild(document.createElement('b'));
		var t = b.appendChild(document.createTextNode('foo'));
		testIsChild(p, b);
		testIsChild(b, t);
		expect(t.data).toBe('foo');
		p.innerHTML = '';
		testIsChild(b, t);
		expect(t.data).toBe('foo');
	});
}
