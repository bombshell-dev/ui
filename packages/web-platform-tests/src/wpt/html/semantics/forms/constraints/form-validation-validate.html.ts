import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!DOCTYPE html>
<meta charset="utf-8">
<title>Constraint validation</title>




<div id="log"></div>
<form id="fm1" style="display:none">
  <fieldset id="test0">
    <input type="text" required value="" id="test1">
  </fieldset>
  <input type="email" value="abc" id="test2">
  <button id="test3">TEST</button>
  <select id="test4"></select>
  <textarea id="test5"></textarea>
  <output id="test6"></output>
</form>
<form id="fm2" style="display:none">
  <fieldset>
    <input type="text" required value="abc">
  </fieldset>
  <input type="email" value="test@example.com">
  <button>TEST</button>
  <select></select>
  <textarea></textarea>
  <output></output>
</form>
<form id="fm3"  style="display:none">
  <fieldset id="fs">
    <legend><input type="text" id="inp1"></legend>
    <input type="text" required value="" id="inp2">
  </fieldset>
</form>


`;
	context.test(
		'If there is any invalid submittable element whose form owner is the form, the form.checkValidity must be false',
		({ document }) => {
			let cancelable = true,
				times1 = 0,
				times2 = 0;
			const invalidList1: (EventTarget | null)[] = [];
			const invalidList2: Element[] = [];
			const fm1 = document.getElementById('fm1') as HTMLFormElement;
			const fm2 = document.getElementById('fm2') as HTMLFormElement;
			const fm3 = document.getElementById('fm3') as HTMLFormElement;
			const test1 = document.getElementById('test1');
			const test2 = document.getElementById('test2');
			for (let index = 0; index < fm1.elements.length; index++) {
				const ele = fm1.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					(e) => {
						times1++;
						invalidList1.push(e.target);
						if (!e.cancelable) cancelable = e.cancelable;
					},
					false,
				);
			}
			// Preserve the upstream callback's shared ele binding.
			let ele: Element;
			for (let index = 0; index < fm2.elements.length; index++) {
				ele = fm2.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					() => {
						times2++;
						invalidList2.push(ele);
					},
					false,
				);
			}

			expect(fm1.checkValidity(), 'The checkValidity method should be false.').toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If there is any invalid submittable element whose form owner is the form, the form.reportValidity must be false',
		({ document }) => {
			let cancelable = true,
				times1 = 0,
				times2 = 0;
			const invalidList1: (EventTarget | null)[] = [];
			const invalidList2: Element[] = [];
			const fm1 = document.getElementById('fm1') as HTMLFormElement;
			const fm2 = document.getElementById('fm2') as HTMLFormElement;
			const fm3 = document.getElementById('fm3') as HTMLFormElement;
			const test1 = document.getElementById('test1');
			const test2 = document.getElementById('test2');
			for (let index = 0; index < fm1.elements.length; index++) {
				const ele = fm1.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					(e) => {
						times1++;
						invalidList1.push(e.target);
						if (!e.cancelable) cancelable = e.cancelable;
					},
					false,
				);
			}
			// Preserve the upstream callback's shared ele binding.
			let ele: Element;
			for (let index = 0; index < fm2.elements.length; index++) {
				ele = fm2.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					() => {
						times2++;
						invalidList2.push(ele);
					},
					false,
				);
			}

			expect('reportValidity' in fm1, 'The reportValidity method is not supported').toBe(true);
			expect(fm1.reportValidity(), 'The reportValidity method should be false.').toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If all of the submittable elements whose form owner is the form are valid, the form.checkValidity must be true',
		({ document }) => {
			let cancelable = true,
				times1 = 0,
				times2 = 0;
			const invalidList1: (EventTarget | null)[] = [];
			const invalidList2: Element[] = [];
			const fm1 = document.getElementById('fm1') as HTMLFormElement;
			const fm2 = document.getElementById('fm2') as HTMLFormElement;
			const fm3 = document.getElementById('fm3') as HTMLFormElement;
			const test1 = document.getElementById('test1');
			const test2 = document.getElementById('test2');
			for (let index = 0; index < fm1.elements.length; index++) {
				const ele = fm1.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					(e) => {
						times1++;
						invalidList1.push(e.target);
						if (!e.cancelable) cancelable = e.cancelable;
					},
					false,
				);
			}
			// Preserve the upstream callback's shared ele binding.
			let ele: Element;
			for (let index = 0; index < fm2.elements.length; index++) {
				ele = fm2.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					() => {
						times2++;
						invalidList2.push(ele);
					},
					false,
				);
			}

			expect(fm2.checkValidity(), 'The checkValidity method should be true.').toBe(true);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If all of the submittable elements whose form owner is the form are valid, the form.reportValidity must be true',
		({ document }) => {
			let cancelable = true,
				times1 = 0,
				times2 = 0;
			const invalidList1: (EventTarget | null)[] = [];
			const invalidList2: Element[] = [];
			const fm1 = document.getElementById('fm1') as HTMLFormElement;
			const fm2 = document.getElementById('fm2') as HTMLFormElement;
			const fm3 = document.getElementById('fm3') as HTMLFormElement;
			const test1 = document.getElementById('test1');
			const test2 = document.getElementById('test2');
			for (let index = 0; index < fm1.elements.length; index++) {
				const ele = fm1.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					(e) => {
						times1++;
						invalidList1.push(e.target);
						if (!e.cancelable) cancelable = e.cancelable;
					},
					false,
				);
			}
			// Preserve the upstream callback's shared ele binding.
			let ele: Element;
			for (let index = 0; index < fm2.elements.length; index++) {
				ele = fm2.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					() => {
						times2++;
						invalidList2.push(ele);
					},
					false,
				);
			}

			expect('reportValidity' in fm2, 'The reportValidity method is not supported.').toBe(true);
			expect(fm2.reportValidity(), 'The reportValidity method should be true.').toBe(true);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Check the checkValidity method of the form element when it has a fieldset child',
		({ document }) => {
			let cancelable = true,
				times1 = 0,
				times2 = 0;
			const invalidList1: (EventTarget | null)[] = [];
			const invalidList2: Element[] = [];
			const fm1 = document.getElementById('fm1') as HTMLFormElement;
			const fm2 = document.getElementById('fm2') as HTMLFormElement;
			const fm3 = document.getElementById('fm3') as HTMLFormElement;
			const test1 = document.getElementById('test1');
			const test2 = document.getElementById('test2');
			for (let index = 0; index < fm1.elements.length; index++) {
				const ele = fm1.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					(e) => {
						times1++;
						invalidList1.push(e.target);
						if (!e.cancelable) cancelable = e.cancelable;
					},
					false,
				);
			}
			// Preserve the upstream callback's shared ele binding.
			let ele: Element;
			for (let index = 0; index < fm2.elements.length; index++) {
				ele = fm2.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					() => {
						times2++;
						invalidList2.push(ele);
					},
					false,
				);
			}

			expect(fm3.checkValidity(), 'The checkValidity method should be false.').toBe(false);
			(document.getElementById('fs') as HTMLFieldSetElement).disabled = true;
			expect(fm3.checkValidity(), 'The checkValidity method should be true.').toBe(true);

			(document.getElementById('inp1') as HTMLInputElement).value = 'aaa';
			(document.getElementById('inp1') as HTMLInputElement).type = 'url';
			expect(fm3.checkValidity(), 'The checkValidity method should be false.').toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Check the reportValidity method of the form element when it has a fieldset child',
		({ document }) => {
			let cancelable = true,
				times1 = 0,
				times2 = 0;
			const invalidList1: (EventTarget | null)[] = [];
			const invalidList2: Element[] = [];
			const fm1 = document.getElementById('fm1') as HTMLFormElement;
			const fm2 = document.getElementById('fm2') as HTMLFormElement;
			const fm3 = document.getElementById('fm3') as HTMLFormElement;
			const test1 = document.getElementById('test1');
			const test2 = document.getElementById('test2');
			for (let index = 0; index < fm1.elements.length; index++) {
				const ele = fm1.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					(e) => {
						times1++;
						invalidList1.push(e.target);
						if (!e.cancelable) cancelable = e.cancelable;
					},
					false,
				);
			}
			// Preserve the upstream callback's shared ele binding.
			let ele: Element;
			for (let index = 0; index < fm2.elements.length; index++) {
				ele = fm2.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					() => {
						times2++;
						invalidList2.push(ele);
					},
					false,
				);
			}

			// Restore the condition to default which was modified during the previous test.
			(document.getElementById('fs') as HTMLFieldSetElement).disabled = false;
			(document.getElementById('inp1') as HTMLInputElement).value = '';
			(document.getElementById('inp1') as HTMLInputElement).type = 'text';

			expect('reportValidity' in fm3, 'The reportValidity method is not supported.').toBe(true);
			expect(fm3.reportValidity(), 'The reportValidity method should be false.').toBe(false);
			(document.getElementById('fs') as HTMLFieldSetElement).disabled = true;
			expect(fm3.reportValidity(), 'The reportValidity method should be true.').toBe(true);

			(document.getElementById('inp1') as HTMLInputElement).value = 'aaa';
			(document.getElementById('inp1') as HTMLInputElement).type = 'url';
			expect(fm3.reportValidity(), 'The reportValidity method should be false.').toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'The invalid event must be fired at the invalid controls',
		({ document }) => {
			let cancelable = true,
				times1 = 0,
				times2 = 0;
			const invalidList1: (EventTarget | null)[] = [];
			const invalidList2: Element[] = [];
			const fm1 = document.getElementById('fm1') as HTMLFormElement;
			const fm2 = document.getElementById('fm2') as HTMLFormElement;
			const fm3 = document.getElementById('fm3') as HTMLFormElement;
			const test1 = document.getElementById('test1');
			const test2 = document.getElementById('test2');
			for (let index = 0; index < fm1.elements.length; index++) {
				const ele = fm1.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					(e) => {
						times1++;
						invalidList1.push(e.target);
						if (!e.cancelable) cancelable = e.cancelable;
					},
					false,
				);
			}
			// Preserve the upstream callback's shared ele binding.
			let ele: Element;
			for (let index = 0; index < fm2.elements.length; index++) {
				ele = fm2.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					() => {
						times2++;
						invalidList2.push(ele);
					},
					false,
				);
			}
			// These events are produced by the preceding upstream validation cases.
			fm1.checkValidity();
			fm1.reportValidity();

			expect(
				times1,
				'The invalid event will be fired if the checkValidity or reportValidity method are called.',
			).toBe(4);
			expect(invalidList1, 'The invalid event must be fired at the invalid control').toHaveLength(
				4,
			);
			expect(invalidList1[0], 'The invalid event must be fired at the invalid control').toBe(test1);
			expect(invalidList1[1], 'The invalid event must be fired at the invalid control').toBe(test2);
			expect(invalidList1[2], 'The invalid event must be fired at the invalid control').toBe(test1);
			expect(invalidList1[3], 'The invalid event must be fired at the invalid control').toBe(test2);
			expect(cancelable, 'The invalid event is cancelable.').toBe(true);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'The invalid event must not be fired at the invalid controls',
		({ document }) => {
			let cancelable = true,
				times1 = 0,
				times2 = 0;
			const invalidList1: (EventTarget | null)[] = [];
			const invalidList2: Element[] = [];
			const fm1 = document.getElementById('fm1') as HTMLFormElement;
			const fm2 = document.getElementById('fm2') as HTMLFormElement;
			const fm3 = document.getElementById('fm3') as HTMLFormElement;
			const test1 = document.getElementById('test1');
			const test2 = document.getElementById('test2');
			for (let index = 0; index < fm1.elements.length; index++) {
				const ele = fm1.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					(e) => {
						times1++;
						invalidList1.push(e.target);
						if (!e.cancelable) cancelable = e.cancelable;
					},
					false,
				);
			}
			// Preserve the upstream callback's shared ele binding.
			let ele: Element;
			for (let index = 0; index < fm2.elements.length; index++) {
				ele = fm2.elements.item(index)!;
				ele.addEventListener(
					'invalid',
					() => {
						times2++;
						invalidList2.push(ele);
					},
					false,
				);
			}
			fm2.checkValidity();
			fm2.reportValidity();

			expect(times2, 'The invalid event should not be fired, times should be 0.').toBe(0);
			expect(
				invalidList2,
				'The invalid event should not be fired, invalid list should be empty',
			).toHaveLength(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
