import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!doctype html>
<meta charset=utf-8>
<title>Form named getter</title>


<div id=log></div>
<!-- XXX Nothing tests id attributes yet. -->
<!-- XXX We also need tests for moving inputs and forms in the DOM. -->
<form>
<input type=button name=button>
<input type=radio name=radio value=x>
<input type=radio name=radio value=y>
<input type=radio name=radio value=z>
</form>

<form>
<button name=l1></button>
<fieldset name=l2></fieldset>
<input type=hidden name=l3>
<input type=text name=l4>
<input type=search name=l5>
<input type=tel name=l6>
<input type=url name=l7>
<input type=email name=l8>
<input type=password name=l9>
<input type=datetime name=l10>
<input type=date name=l11>
<input type=month name=l12>
<input type=week name=l13>
<input type=time name=l14>
<input type=datetime-local name=l15>
<input type=number name=l16>
<input type=range name=l17>
<input type=color name=l18>
<input type=checkbox name=l19>
<input type=radio name=l20>
<input type=file name=l21>
<input type=submit name=l22>
<input type=image name=l23>
<input type=reset name=l24>
<input type=button name=l25>
<input type=foo name=l26>
<input name=l27>
<object name=l28></object>
<output name=l29></output>
<select name=l30></select>
<textarea name=l31></textarea>
</form>

<form>
<!-- EventTarget -->
<input type=radio name=addEventListener>
<input type=radio name=removeEventListener>
<input type=radio name=dispatchEvent>

<!-- Node -->
<input type=radio name=nodeType>
<input type=radio name=nodeName>
<input type=radio name=ownerDocument>

<!-- Element -->
<input type=radio name=namespaceURI>
<input type=radio name=prefix>
<input type=radio name=localName>

<!-- HTMLElement -->
<input type=radio name=title>
<input type=radio name=lang>
<input type=radio name=dir>

<!-- HTMLFormElement -->
<input type=radio name=acceptCharset>
<input type=radio name=action>
<input type=radio name=autocomplete>
<input type=radio name=enctype>
<input type=radio name=encoding>
<input type=radio name=method>
<input type=radio name=name>
<input type=radio name=noValidate>
<input type=radio name=target>
<input type=radio name=elements>
<input type=radio name=length>
<input type=radio name=submit>
<input type=radio name=reset>
<input type=radio name=checkValidity>
</form>

<img name=x>
<form></form><!-- no child nodes -->
<img name=y>
<form><!-- a child node --></form>
<img name=z>

<input form=a name=b>
<form id=a></form>
<input form=c name=d>
<input form=c name=d>
<form id=c></form>

`;
	context.test(
		'Forms should not have an item method',
		({ document }) => {
			let form = document.getElementsByTagName('form')[0]!;
			expect(form.item).toBe(undefined);
			expect('item' in form).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Forms should not have a namedItem method',
		({ document }) => {
			let form = document.getElementsByTagName('form')[0]!;
			expect(form.namedItem).toBe(undefined);
			expect('namedItem' in form).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Name for a single element should work',
		({ document }) => {
			let form = document.getElementsByTagName('form')[0]!;
			let button = document.getElementsByTagName('input')[0]!;
			expect(button.type).toBe('button');
			expect(form.button).toBe(button);
			let desc = Object.getOwnPropertyDescriptor(form, 'button')!;
			expect(desc.value).toBe(button);
			expect(desc.writable).toBe(false);
			expect(desc.configurable).toBe(true);
			expect(desc.enumerable).toBe(false);
			expect(form.button.length).toBe(undefined);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Calling item() on the NodeList returned from the named getter should work',
		({ document }) => {
			let form = document.getElementsByTagName('form')[0]!;
			expect(form.radio.item(-1)).toBe(null);
			expect(
				[0, 1, 2].map(function (i) {
					return form.radio.item(i).value;
				}),
			).toHaveLength(3);
			expect(
				[0, 1, 2].map(function (i) {
					return form.radio.item(i).value;
				})[0],
			).toBe('x');
			expect(
				[0, 1, 2].map(function (i) {
					return form.radio.item(i).value;
				})[1],
			).toBe('y');
			expect(
				[0, 1, 2].map(function (i) {
					return form.radio.item(i).value;
				})[2],
			).toBe('z');
			expect(form.radio.item(3)).toBe(null);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Indexed getter on the NodeList returned from the named getter should work',
		({ document }) => {
			let form = document.getElementsByTagName('form')[0]!;
			expect(form.radio.length).toBe(3);
			expect(form.radio[-1]).toBe(undefined);
			expect(
				[0, 1, 2].map(function (i) {
					return form.radio[i].value;
				}),
			).toHaveLength(3);
			expect(
				[0, 1, 2].map(function (i) {
					return form.radio[i].value;
				})[0],
			).toBe('x');
			expect(
				[0, 1, 2].map(function (i) {
					return form.radio[i].value;
				})[1],
			).toBe('y');
			expect(
				[0, 1, 2].map(function (i) {
					return form.radio[i].value;
				})[2],
			).toBe('z');
			expect(form.radio[3]).toBe(undefined);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'All listed elements except input type=image should be present in the form',
		({ document }) => {
			let form = document.getElementsByTagName('form')[1]!;
			for (let i = 1; i <= 31; ++i) {
				if (i == 23) {
					// input type=image
					expect(form['l' + i]).toBe(undefined);
				} else {
					expect(form['l' + i]).toBe(form.children[i - 1]);
				}
			}
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Named elements should override builtins',
		({ document }) => {
			let names = [
				// EventTarget
				'addEventListener',
				'removeEventListener',
				'dispatchEvent',
				// Node
				'nodeType',
				'nodeName',
				'ownerDocument',
				// Element
				'namespaceURI',
				'prefix',
				'localName',
				// HTMLElement
				'title',
				'lang',
				'dir',
				// HTMLFormElement
				'acceptCharset',
				'action',
				'autocomplete',
				'enctype',
				'encoding',
				'method',
				'name',
				'noValidate',
				'target',
				'elements',
				'length',
				'submit',
				'reset',
				'checkValidity',
			];
			let form = document.getElementsByTagName('form')[2]!;
			names.forEach(function (name, i) {
				expect(form[name]).toBe(form.children[i]);
			});
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Named items outside the form should not be returned (no children)',
		({ document }) => {
			let form = document.getElementsByTagName('form')[3]!;
			expect(form.x, 'x should not be associated with the form').toBe(undefined);
			expect(form.y, 'y should not be associated with the form').toBe(undefined);
			expect(form.z, 'z should not be associated with the form').toBe(undefined);
			expect(form[0], 'The form should not have supported property indices').toBe(undefined);
			expect(form.length).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Named items outside the form should not be returned (one child)',
		({ document }) => {
			let form = document.getElementsByTagName('form')[4]!;
			expect(form.x, 'x should not be associated with the form').toBe(undefined);
			expect(form.y, 'y should not be associated with the form').toBe(undefined);
			expect(form.z, 'z should not be associated with the form').toBe(undefined);
			expect(form[0], 'The form should not have supported property indices').toBe(undefined);
			expect(form.length).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'The form attribute should be taken into account for named getters (single element)',
		({ document }) => {
			let form = document.getElementsByTagName('form')[5]!;
			expect(form.id).toBe('a');

			let input = document.getElementsByName('b')[0]!;
			expect(input.localName).toBe('input');
			expect(input.getAttribute('form')).toBe('a');

			expect(form.b).toBe(input);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'The form attribute should be taken into account for named getters (multiple elements)',
		({ document, NodeList }) => {
			let form = document.getElementsByTagName('form')[6]!;
			expect(form.id).toBe('c');

			let input1 = document.getElementsByName('d')[0]!;
			expect(input1.localName).toBe('input');
			expect(input1.getAttribute('form')).toBe('c');

			let input2 = document.getElementsByName('d')[1]!;
			expect(input2.localName).toBe('input');
			expect(input2.getAttribute('form')).toBe('c');

			let desc = Object.getOwnPropertyDescriptor(form, 'd')!;
			expect(desc.value).toBe(form.d);
			expect(desc.writable).toBe(false);
			expect(desc.configurable).toBe(true);
			expect(desc.enumerable).toBe(false);

			expect(form.d instanceof NodeList, 'form.d should be a NodeList').toBe(true);
			expect(form.d).toHaveLength(2);
			expect(form.d[0]).toBe(input1);
			expect(form.d[1]).toBe(input2);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Input should only be a named property on the innermost form that contains it',
		({ document }) => {
			let f = document.body.appendChild(document.createElement('form'));
			f.id = 'f';
			let g = f.appendChild(document.createElement('form'));
			g.id = 'g';
			let input = g.appendChild(document.createElement('input'));
			input.name = 'x';
			expect(f.x).toBe(undefined);
			expect(g.x).toBe(input);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Past names map should work correctly',
		({ document }) => {
			let form = document.getElementsByTagName('form')[1]!;

			let i1 = document.createElement('input');
			i1.name = 'past-name1';
			i1.id = 'past-id1';

			expect(form['past-name1']).toBe(undefined);
			expect(form['past-id1']).toBe(undefined);
			form.appendChild(i1);
			expect(form['past-name1']).toBe(i1);
			expect(form['past-id1']).toBe(i1);

			i1.name = 'twiddled-name1';
			i1.id = 'twiddled-id1';
			expect(form['past-name1']).toBe(i1);
			expect(form['twiddled-name1']).toBe(i1);
			expect(form['past-id1']).toBe(i1);
			expect(form['twiddled-id1']).toBe(i1);

			i1.name = 'twiddled-name2';
			i1.id = 'twiddled-id2';
			expect(form['past-name1']).toBe(i1);
			expect(form['twiddled-name1']).toBe(i1);
			expect(form['twiddled-name2']).toBe(i1);
			expect(form['past-id1']).toBe(i1);
			expect(form['twiddled-id1']).toBe(i1);
			expect(form['twiddled-id2']).toBe(i1);

			i1.removeAttribute('id');
			i1.removeAttribute('name');
			expect(form['past-name1']).toBe(i1);
			expect(form['twiddled-name1']).toBe(i1);
			expect(form['twiddled-name2']).toBe(i1);
			expect(form['past-id1']).toBe(i1);
			expect(form['twiddled-id1']).toBe(i1);
			expect(form['twiddled-id2']).toBe(i1);

			i1.remove();
			expect(form['past-name1']).toBe(undefined);
			expect(form['twiddled-name1']).toBe(undefined);
			expect(form['twiddled-name2']).toBe(undefined);
			expect(form['past-id1']).toBe(undefined);
			expect(form['twiddled-id1']).toBe(undefined);
			expect(form['twiddled-id2']).toBe(undefined);

			let i2 = document.createElement('input');
			i2.name = 'past-name2';
			i2.id = 'past-id2';

			expect(form['past-name2']).toBe(undefined);
			expect(form['past-id2']).toBe(undefined);
			form.appendChild(i2);
			expect(form['past-name2']).toBe(i2);
			expect(form['past-id2']).toBe(i2);

			i2.name = 'twiddled-name3';
			i2.id = 'twiddled-id3';
			expect(form['past-name2']).toBe(i2);
			expect(form['twiddled-name3']).toBe(i2);
			expect(form['past-id2']).toBe(i2);
			expect(form['twiddled-id3']).toBe(i2);

			i2.name = 'twiddled-name4';
			i2.id = 'twiddled-id4';
			expect(form['past-name2']).toBe(i2);
			expect(form['twiddled-name3']).toBe(i2);
			expect(form['twiddled-name4']).toBe(i2);
			expect(form['past-id2']).toBe(i2);
			expect(form['twiddled-id3']).toBe(i2);
			expect(form['twiddled-id4']).toBe(i2);

			i2.removeAttribute('id');
			i2.removeAttribute('name');
			expect(form['past-name2']).toBe(i2);
			expect(form['twiddled-name3']).toBe(i2);
			expect(form['twiddled-name4']).toBe(i2);
			expect(form['past-id2']).toBe(i2);
			expect(form['twiddled-id3']).toBe(i2);
			expect(form['twiddled-id4']).toBe(i2);

			i2.setAttribute('form', 'c');
			expect(form['past-name2']).toBe(undefined);
			expect(form['twiddled-name3']).toBe(undefined);
			expect(form['twiddled-name4']).toBe(undefined);
			expect(form['past-id2']).toBe(undefined);
			expect(form['twiddled-id3']).toBe(undefined);
			expect(form['twiddled-id4']).toBe(undefined);
		},
		{ document: { contentType: 'text/html', content } },
	);

	context.test(
		'Invoking a legacycaller on the NodeList returned from the named getter should not work',
		({ document }) => {
			const form = document.getElementsByTagName('form')[0]!;
			const indices = [-1, 0, 1, 2, 3];
			indices.forEach((i) => {
				expect(() => {
					form.radio(i);
				}).toThrow(globalThis.TypeError);
			});
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Trying to set an expando that would shadow an already-existing named property',
		({ document }) => {
			const form = document.getElementsByTagName('form')[1]!;
			const old_item = form['l1'];
			const old_desc = Object.getOwnPropertyDescriptor(form, 'l1')!;
			expect(old_desc.value).toBe(old_item);
			expect(old_desc.enumerable).toBe(false);
			expect(old_desc.configurable).toBe(true);
			expect(old_desc.writable).toBe(false);
			// Reflect preserves upstream's non-strict assignment and delete in this module.
			Reflect.set(form, 'l1', 5);
			expect(form['l1']).toBe(old_item);
			expect(() => {
				form['l1'] = 5;
			}).toThrow(globalThis.TypeError);
			expect(() => {
				Object.defineProperty(form, 'l1', { value: 5 });
			}).toThrow(globalThis.TypeError);
			Reflect.deleteProperty(form, 'l1');
			expect(form['l1']).toBe(old_item);
			expect(() => {
				delete form['l1'];
			}).toThrow(globalThis.TypeError);
			expect(form['l1']).toBe(old_item);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Trying to set an expando that shadows a named property that gets added later',
		({ document, cleanup }) => {
			const form = document.getElementsByTagName('form')[1]!;
			const old_item = form['new-name'];
			const old_desc = Object.getOwnPropertyDescriptor(form, 'new-name');
			expect(old_item).toBe(undefined);
			expect(old_desc).toBe(undefined);
			form['new-name'] = 5;
			expect(form['new-name']).toBe(5);
			const input = document.createElement('input');
			cleanup(() => {
				input.remove();
			});
			input.name = 'new-name';
			form.appendChild(input);
			expect(form['new-name']).toBe(5);
			delete form['new-name'];
			expect(form['new-name']).toBe(input);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Trying to set a non-configurable expando that shadows a named property that gets added later',
		({ document, cleanup }) => {
			const form = document.getElementsByTagName('form')[1]!;
			const old_item = form['new-name2'];
			const old_desc = Object.getOwnPropertyDescriptor(form, 'new-name2');
			expect(old_item).toBe(undefined);
			expect(old_desc).toBe(undefined);
			Object.defineProperty(form, 'new-name2', { configurable: false, writable: false, value: 5 });
			expect(form['new-name2']).toBe(5);
			const input = document.createElement('input');
			cleanup(() => {
				input.remove();
			});
			input.name = 'new-name2';
			form.appendChild(input);
			expect(form['new-name2']).toBe(5);
			// Reflect preserves upstream's non-strict delete in this module.
			Reflect.deleteProperty(form, 'new-name2');
			expect(form['new-name2']).toBe(5);
			expect(() => {
				delete form['new-name2'];
			}).toThrow(globalThis.TypeError);
			expect(form['new-name2']).toBe(5);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
