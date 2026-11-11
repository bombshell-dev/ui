import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const checkParentNode = (document: Document, node: Node) => {
		expect(node.childNodes).toHaveLength(0);

		let children = node.childNodes;
		let child = document.createElement('p');
		node.appendChild(child);
		expect(node.childNodes).toBe(children);
		expect(children).toHaveLength(1);
		expect(children[0]).toBe(child);
		expect(children.item(0)).toBe(child);

		let child2 = document.createComment('comment');
		node.appendChild(child2);
		expect(children).toHaveLength(2);
		expect(children[0]).toBe(child);
		expect(children[1]).toBe(child2);
		expect(children.item(0)).toBe(child);
		expect(children.item(1)).toBe(child2);

		expect(2 in children).toBe(false);
		expect(children[2]).toBe(undefined);
		expect(children.item(2)).toBe(null);
	};

	context.test('Caching of Node.childNodes', ({ document }) => {
		let element = document.createElement('p');
		expect(element.childNodes).toBe(element.childNodes);
	});
	context.test('Node.childNodes on an Element.', ({ document }) => {
		checkParentNode(document, document.createElement('p'));
	});
	context.test('Node.childNodes on a DocumentFragment.', ({ document }) => {
		checkParentNode(document, document.createDocumentFragment());
	});
	context.test('Node.childNodes on a Document.', ({ document, Document }) => {
		checkParentNode(document, new Document());
	});
	context.test('Iterator behavior of Node.childNodes', ({ document, Array }) => {
		let node = document.createElement('div');
		let kid1 = document.createElement('p');
		let kid2 = document.createTextNode('hey');
		let kid3 = document.createElement('span');
		node.appendChild(kid1);
		node.appendChild(kid2);
		node.appendChild(kid3);

		let list = node.childNodes;
		expect([...list]).toHaveLength(3);
		expect([...list][0]).toBe(kid1);
		expect([...list][1]).toBe(kid2);
		expect([...list][2]).toBe(kid3);

		const keyIterator = list.keys();
		expect(keyIterator instanceof Array).toBe(false);
		const keys = [...keyIterator];
		expect(keys).toHaveLength(3);
		expect(keys[0]).toBe(0);
		expect(keys[1]).toBe(1);
		expect(keys[2]).toBe(2);

		const valueIterator = list.values();
		expect(valueIterator instanceof Array).toBe(false);
		const values = [...valueIterator];
		expect(values).toHaveLength(3);
		expect(values[0]).toBe(kid1);
		expect(values[1]).toBe(kid2);
		expect(values[2]).toBe(kid3);

		const entryIterator = list.entries();
		expect(entryIterator instanceof Array).toBe(false);
		const entries = [...entryIterator];
		expect(entries.length).toBe(keys.length);
		expect(entries.length).toBe(values.length);
		for (let i = 0; i < entries.length; ++i) {
			expect(entries[i]!).toHaveLength(2);
			expect(entries[i]![0]).toBe(keys[i]);
			expect(entries[i]![1]).toBe(values[i]);
		}

		let cur = 0;
		let thisObj = {};
		list.forEach(function (this: unknown, value, key, listObj) {
			expect(listObj).toBe(list);
			expect(this).toBe(thisObj);
			expect(value).toBe(values[cur]);
			expect(key).toBe(keys[cur]);
			cur++;
		}, thisObj);
		expect(cur).toBe(entries.length);

		expect(list[Symbol.iterator]).toBe(Array.prototype[Symbol.iterator]);
		expect(list.keys).toBe(Array.prototype.keys);
		if (Array.prototype.values) {
			expect(list.values).toBe(Array.prototype.values);
		}
		expect(list.entries).toBe(Array.prototype.entries);
		expect(list.forEach).toBe(Array.prototype.forEach);
	});
	context.test(
		'Node.childNodes should be a live collection',
		({ document, NodeList }) => {
			let node = document.getElementById('test')!;
			let children = node.childNodes;
			expect(children instanceof NodeList).toBe(true);
			let li = document.createElement('li');
			expect(children.length).toBe(4);

			node.appendChild(li);
			expect(children.length).toBe(5);

			node.removeChild(li);
			expect(children.length).toBe(4);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id="log"></div><div style="display: none"><ul id="test"><li>1</li><li>2</li><li>3</li><li>4</li></ul></div>',
			},
		},
	);
}
