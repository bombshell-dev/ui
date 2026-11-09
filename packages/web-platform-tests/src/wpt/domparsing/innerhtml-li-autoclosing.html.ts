import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Adjacent empty li elements in ul produce siblings.', ({ document }) => {
		var div = document.createElement('div');
		div.innerHTML = '<ul><li><li></li></li></ul>';
		var ul = div.querySelector('ul')!;
		expect(ul.children.length, 'ul should have 2 children').toBe(2);
		expect(ul.innerHTML).toBe('<li></li><li></li>');
	});
	context.test('Adjacent empty li elements in ol produce siblings.', ({ document }) => {
		var div = document.createElement('div');
		div.innerHTML = '<ol><li><li></li></li></ol>';
		var ol = div.querySelector('ol')!;
		expect(ol.children.length, 'ol should have 2 children').toBe(2);
		expect(ol.innerHTML).toBe('<li></li><li></li>');
	});
	context.test('Adjacent li elements with text content produce siblings.', ({ document }) => {
		var div = document.createElement('div');
		div.innerHTML = '<ul><li>first<li>second</li></li></ul>';
		var ul = div.querySelector('ul')!;
		expect(ul.children.length, 'ul should have 2 children').toBe(2);
		expect(ul.innerHTML).toBe('<li>first</li><li>second</li>');
	});
	context.test('Three adjacent li elements produce siblings.', ({ document }) => {
		var div = document.createElement('div');
		div.innerHTML = '<ul><li>a<li>b<li>c</li></li></li></ul>';
		var ul = div.querySelector('ul')!;
		expect(ul.children.length, 'ul should have 3 children').toBe(3);
		expect(ul.innerHTML).toBe('<li>a</li><li>b</li><li>c</li>');
	});
	context.test('Legitimate li nesting through intervening ul is preserved.', ({ document }) => {
		var div = document.createElement('div');
		div.innerHTML = '<ul><li><ul><li>nested</li></ul></li></ul>';
		var outerUl = div.querySelector('ul')!;
		expect(outerUl.children.length, 'outer ul should have 1 child').toBe(1);
		var innerUl = outerUl.querySelector('ul')!;
		expect(innerUl.children.length, 'inner ul should have 1 child').toBe(1);
		expect(innerUl.innerHTML).toBe('<li>nested</li>');
	});
	context.test(
		'Adjacent li elements produce siblings when ul is nested in div.',
		({ document }) => {
			var div = document.createElement('div');
			div.innerHTML = '<div><ul><li><li></li></li></ul></div>';
			var ul = div.querySelector('ul')!;
			expect(ul.children.length, 'ul should have 2 children').toBe(2);
		},
	);
	context.test('Adjacent li elements with attributes produce siblings.', ({ document }) => {
		var div = document.createElement('div');
		div.innerHTML = '<ul><li class="a"><li class="b"></li></li></ul>';
		var ul = div.querySelector('ul')!;
		expect(ul.children.length, 'ul should have 2 children').toBe(2);
		expect(ul.children[0]!.className).toBe('a');
		expect(ul.children[1]!.className).toBe('b');
	});
}
