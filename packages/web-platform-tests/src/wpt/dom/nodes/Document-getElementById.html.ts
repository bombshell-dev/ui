import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const markup = `<!doctype html><body>
  <div id="log"></div>

  <!-- test 0 -->
  <div id=""></div>

  <!-- test 1 -->
  <div id="test1"></div>

  <!-- test 5 -->
  <div id="test5" data-name="1st">
    <p id="test5" data-name="2nd">P</p>
    <input id="test5" type="submit" value="Submit" data-name="3rd">
  </div>

  <!-- test 15 -->
  <div id="outer">
    <div id="middle">
      <div id="inner"></div>
    </div>
  </div>

</body>`;

	const { expect } = context.runner;

	context.test(
		'Calling document.getElementById with an empty string argument.',
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			expect(document.getElementById('')!).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Calling document.getElementById with a null argument.',
		({ document, cleanup }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let element = document.createElement('div');
			element.setAttribute('id', 'null');
			document.body.appendChild(element);
			cleanup(function () {
				document.body.removeChild(element);
			});
			expect(document.getElementById(null as unknown as string)!).toBe(element);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Calling document.getElementById with an undefined argument.',
		({ document, cleanup }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let element = document.createElement('div');
			element.setAttribute('id', 'undefined');
			document.body.appendChild(element);
			cleanup(function () {
				document.body.removeChild(element);
			});
			expect(document.getElementById(undefined as unknown as string)!).toBe(element);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'on static page',
		(fixture) => {
			const { document } = fixture;
			const gBody = document.getElementsByTagName('body')[0]!;
			const HTMLDivElement = fixture.HTMLDivElement;

			let bar = document.getElementById('test1')!;
			expect(bar, 'should not be null').not.toBe(null);
			expect(bar.tagName, 'should have expected tag name.').toBe('DIV');
			expect(bar instanceof HTMLDivElement, 'should be a valid Element instance').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Document.getElementById with a script-inserted element',
		(fixture) => {
			const { document } = fixture;
			const gBody = document.getElementsByTagName('body')[0]!;
			const HTMLDivElement = fixture.HTMLDivElement;

			let TEST_ID = 'test2';

			let test = document.createElement('div');
			test.setAttribute('id', TEST_ID);
			gBody.appendChild(test);

			// test: appended element
			let result = document.getElementById(TEST_ID)!;
			expect(result, 'should not be null.').not.toBe(null);
			expect(result.tagName, "should have appended element's tag name").toBe('DIV');
			expect(result instanceof HTMLDivElement, 'should be a valid Element instance').toBe(true);

			// test: removed element
			gBody.removeChild(test);
			let removed = document.getElementById(TEST_ID)!;
			// `document.getElementById()` returns `null` if there is none.
			// https://dom.spec.whatwg.org/#dom-nonelementparentnode-getelementbyid
			expect(removed, 'should not get removed element.').toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'update `id` attribute via setAttribute/removeAttribute',
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			// setup fixtures.
			let TEST_ID = 'test3';
			let test = document.createElement('div');
			test.setAttribute('id', TEST_ID);
			gBody.appendChild(test);

			// update id
			let UPDATED_ID = 'test3-updated';
			test.setAttribute('id', UPDATED_ID);
			let e = document.getElementById(UPDATED_ID)!;
			expect(e, 'should get the element with id.').toBe(test);

			let old = document.getElementById(TEST_ID)!;
			expect(old, "shouldn't get the element by the old id.").toBe(null);

			// remove id.
			test.removeAttribute('id');
			let e2 = document.getElementById(UPDATED_ID)!;
			expect(e2, 'should return null when the passed id is none in document.').toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Ensure that the id attribute only affects elements present in a document',
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let TEST_ID = 'test4-should-not-exist';

			let e = document.createElement('div');
			e.setAttribute('id', TEST_ID);

			expect(document.getElementById(TEST_ID)!, 'should be null').toBe(null);
			document.body.appendChild(e);
			expect(document.getElementById(TEST_ID)!, 'should be the appended element').toBe(e);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"in tree order, within the context object's tree",
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			// the method should return the 1st element.
			let TEST_ID = 'test5';
			let target = document.getElementById(TEST_ID)!;
			expect(target, 'should not be null').not.toBe(null);
			expect(target.getAttribute('data-name'), 'should return the 1st').toBe('1st');

			// even if after the new element was appended.
			let element4 = document.createElement('div');
			element4.setAttribute('id', TEST_ID);
			element4.setAttribute('data-name', '4th');
			gBody.appendChild(element4);
			let target2 = document.getElementById(TEST_ID)!;
			expect(target2, 'should not be null').not.toBe(null);
			expect(target2.getAttribute('data-name'), 'should be the 1st').toBe('1st');

			// should return the next element after removed the subtree including the 1st element.
			target2.parentNode!.removeChild(target2);
			let target3 = document.getElementById(TEST_ID)!;
			expect(target3, 'should not be null').not.toBe(null);
			expect(target3.getAttribute('data-name'), 'should be the 4th').toBe('4th');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Modern browsers optimize this method with using internal id cache. ' +
			'This test checks that their optimization should effect only append to `Document`, not append to `Node`.',
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let TEST_ID = 'test6';
			let s = document.createElement('div');
			s.setAttribute('id', TEST_ID);
			// append to Element, not Document.
			document.createElement('div').appendChild(s);

			expect(document.getElementById(TEST_ID)!, 'should be null').toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"changing attribute's value via `Attr` gotten from `Element.attribute`.",
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let TEST_ID = 'test7';
			let element = document.createElement('div');
			element.setAttribute('id', TEST_ID);
			gBody.appendChild(element);

			let target = document.getElementById(TEST_ID)!;
			expect(target, 'should return the element before changing the value').toBe(element);

			element.attributes[0]!.value = TEST_ID + '-updated';
			let target2 = document.getElementById(TEST_ID)!;
			expect(target2, 'should return null after updated id via Attr.value').toBe(null);
			let target3 = document.getElementById(TEST_ID + '-updated')!;
			expect(target3, 'should be equal to the updated element.').toBe(element);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'add id attribute via innerHTML',
		(fixture) => {
			const { document } = fixture;
			const gBody = document.getElementsByTagName('body')[0]!;
			const HTMLDivElement = fixture.HTMLDivElement;

			let TEST_ID = 'test8';

			// setup fixture
			let element = document.createElement('div');
			element.setAttribute('id', TEST_ID + '-fixture');
			gBody.appendChild(element);

			// add id-ed element with using innerHTML
			element.innerHTML = "<div id='" + TEST_ID + "'></div>";
			let test = document.getElementById(TEST_ID)!;
			expect(test, 'should not be null').toBe(element.firstChild);
			expect(test.tagName, 'should have expected tag name.').toBe('DIV');
			expect(test instanceof HTMLDivElement, 'should be a valid Element instance').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'remove id attribute via innerHTML',
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let TEST_ID = 'test9';

			// add fixture
			let container = document.createElement('div');
			container.setAttribute('id', TEST_ID + '-fixture');
			gBody.appendChild(container);

			let element = document.createElement('div');
			element.setAttribute('id', TEST_ID);
			container.appendChild(element);

			// check 'getElementById' should get the 'element'
			expect(document.getElementById(TEST_ID)!, 'should not be null').toBe(element);

			// remove id-ed element with using innerHTML (clear 'element')
			container.innerHTML = '';
			let test = document.getElementById(TEST_ID)!;
			expect(test, 'should be null.').toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'add id attribute via outerHTML',
		(fixture) => {
			const { document } = fixture;
			const gBody = document.getElementsByTagName('body')[0]!;
			const HTMLDivElement = fixture.HTMLDivElement;

			let TEST_ID = 'test10';

			// setup fixture
			let element = document.createElement('div');
			element.setAttribute('id', TEST_ID + '-fixture');
			gBody.appendChild(element);

			// add id-ed element with using outerHTML
			element.outerHTML = "<div id='" + TEST_ID + "'></div>";
			let test = document.getElementById(TEST_ID)!;
			expect(test, 'should not be null').not.toBe(null);
			expect(test.tagName, 'should have expected tag name.').toBe('DIV');
			expect(test instanceof HTMLDivElement, 'should be a valid Element instance').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'remove id attribute via outerHTML',
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let TEST_ID = 'test11';

			let element = document.createElement('div');
			element.setAttribute('id', TEST_ID);
			gBody.appendChild(element);

			let test = document.getElementById(TEST_ID)!;
			expect(test, 'should be equal to the appended element.').toBe(element);

			// remove id-ed element with using outerHTML
			element.outerHTML = '<div></div>';
			test = document.getElementById(TEST_ID)!;
			expect(test, 'should be null.').toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'update `id` attribute via element.id',
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			// setup fixtures.
			let TEST_ID = 'test12';
			let test = document.createElement('div');
			test.id = TEST_ID;
			gBody.appendChild(test);

			// update id
			let UPDATED_ID = TEST_ID + '-updated';
			test.id = UPDATED_ID;
			let e = document.getElementById(UPDATED_ID)!;
			expect(e, 'should get the element with id.').toBe(test);

			let old = document.getElementById(TEST_ID)!;
			expect(old, "shouldn't get the element by the old id.").toBe(null);

			// remove id.
			test.id = '';
			let e2 = document.getElementById(UPDATED_ID)!;
			expect(e2, 'should return null when the passed id is none in document.').toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"where insertion order and tree order don't match",
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let TEST_ID = 'test13';

			let create_same_id_element = function (order: string) {
				let element = document.createElement('div');
				element.setAttribute('id', TEST_ID);
				element.setAttribute('data-order', order); // for debug
				return element;
			};

			// create fixture
			let container = document.createElement('div');
			container.setAttribute('id', TEST_ID + '-fixture');
			gBody.appendChild(container);

			let element1 = create_same_id_element('1');
			let element2 = create_same_id_element('2');
			let element3 = create_same_id_element('3');
			let element4 = create_same_id_element('4');

			// append element: 2 -> 4 -> 3 -> 1
			container.appendChild(element2);
			container.appendChild(element4);
			container.insertBefore(element3, element4);
			container.insertBefore(element1, element2);

			let test = document.getElementById(TEST_ID)!;
			expect(test, 'should return 1st element').toBe(element1);
			container.removeChild(element1);

			test = document.getElementById(TEST_ID)!;
			expect(test, 'should return 2nd element').toBe(element2);
			container.removeChild(element2);

			test = document.getElementById(TEST_ID)!;
			expect(test, 'should return 3rd element').toBe(element3);
			container.removeChild(element3);

			test = document.getElementById(TEST_ID)!;
			expect(test, 'should return 4th element').toBe(element4);
			container.removeChild(element4);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Inserting an id by inserting its parent node',
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let TEST_ID = 'test14';
			let a = document.createElement('a');
			let b = document.createElement('b');
			a.appendChild(b);
			b.id = TEST_ID;
			expect(document.getElementById(TEST_ID)!).toBe(null);

			gBody.appendChild(a);
			expect(document.getElementById(TEST_ID)!).toBe(b);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Document.getElementById must not return nodes not present in document',
		({ document }) => {
			const gBody = document.getElementsByTagName('body')[0]!;

			let TEST_ID = 'test15';
			let outer = document.getElementById('outer')!;
			let middle = document.getElementById('middle')!;
			let inner = document.getElementById('inner')!;
			outer.removeChild(middle);

			let new_el = document.createElement('h1');
			new_el.id = 'heading';
			inner.appendChild(new_el);
			// the new element is not part of the document since
			// "middle" element was removed previously
			expect(document.getElementById('heading')!).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
