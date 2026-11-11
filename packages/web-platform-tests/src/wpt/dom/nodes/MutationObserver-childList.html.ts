import type { CompatibilityContext } from '../../../shared/context.ts';
import { checkRecords } from './mutationobservers.js.ts';

const markup = `<!DOCTYPE HTML>
<meta charset=utf-8>
<title>MutationObservers: childList mutations</title>



<h1>MutationObservers: childList mutations</h1>
<div id="log"></div>

<section style="display: none">
<p id='dummies'>
<span id='d30'>text content</span>
<span id='d35'>text content</span>
<span id='d40'>text content</span>
<span id='d45'>text content</span>
<span id='d50'>text content</span>
<span id='d51'>text content</span>
</p>

</section>
<section style="display: none">
<p id='n00'><span>text content</span></p>

<p id='n10'><span>text content</span></p>
<p id='n11'></p>
<p id='n12'></p>
<p id='n13'><span>text content</span></p>

<p id='n20'>PAS</p>
<p id='n21'>CH</p>

<p id='n30'><span>text content</span></p>
<p id='n31'><span>text content</span></p>
<p id='n32'><span>AN</span><span>CH</span><span>GED</span></p>
<p id='n33'><span>text content</span></p>
<p id='n34'><span>text content</span></p>
<p id='n35'><span>text content</span></p>

<p id='n40'><span>text content</span></p>
<p id='n41'><span>text content</span></p>
<p id='n42'><span>CH</span><span>GED</span><span>AN</span></p>
<p id='n43'><span>text content</span></p>
<p id='n44'><span>text content</span></p>
<p id='n45'><span>text content</span></p>


<p id='n50'><span>text content</span></p>
<p id='n51'><span>text content</span></p>
<p id='n52'><span>NO </span><span>CHANGED</span></p>
<p id='n53'><span>text content</span></p>

<p id='n60'><span>text content</span></p>

<p id='n70'><span>NO </span><span>CHANGED</span></p>
<p id='n71'>CHANN</p>

<p id='n80'><span>NO </span><span>CHANGED</span></p>
<p id='n81'>CHANN</p>

<p id='n90'><span>CHA</span><span>ED</span></p>
<p id='n91'>CHAE</p>

<p id='n100'><span id="s1">CHAN</span><span id="s2">GED</span></p>

<p id='n110'><span>NO </span><span>CHANGED</span><span>TOO</span></p>
<p id='n111'><span>text content</span></p>

</section>




`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function createFragment(document: Document) {
		let fragment = document.createDocumentFragment();
		fragment.appendChild(document.createTextNode('11'));
		fragment.appendChild(document.createTextNode('22'));
		return fragment;
	}
	context.test(
		'childList Node.nodeValue: no mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n00 = document.getElementById('n00')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'attributes', attributeName: 'class' },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n00, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n00, { childList: true, attributes: true });
				(function () {
					n00.nodeValue = '';
					n00.setAttribute('class', 'dummy');
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.textContent: replace content mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n10 = document.getElementById('n10')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					removedNodes: [n10.firstChild!],
					addedNodes: function () {
						return [n10.firstChild!];
					},
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n10, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n10, { childList: true });
				(function () {
					n10.textContent = 'new data';
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.textContent: no previous content mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n11 = document.getElementById('n11')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					addedNodes: function () {
						return [n11.firstChild!];
					},
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n11, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n11, { childList: true });
				(function () {
					n11.textContent = 'new data';
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.textContent: textContent no mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n12 = document.getElementById('n12')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'attributes', attributeName: 'class' },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n12, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n12, { childList: true, attributes: true });
				(function () {
					n12.textContent = '';
					n12.setAttribute('class', 'dummy');
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.textContent: empty string mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n13 = document.getElementById('n13')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n13.firstChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n13, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n13, { childList: true });
				(function () {
					n13.textContent = '';
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.normalize mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n20 = document.getElementById('n20')!;
			n20.appendChild(document.createTextNode('S'));

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n20.lastChild!], previousSibling: n20.firstChild! },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n20, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n20, { childList: true });
				(function () {
					n20.normalize();
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.normalize mutations',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n21 = document.getElementById('n21')!;
			n21.appendChild(document.createTextNode('AN'));
			n21.appendChild(document.createTextNode('GED'));

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					removedNodes: [n21.lastChild!.previousSibling!],
					previousSibling: n21.firstChild!,
					nextSibling: n21.lastChild!,
				},
				{ type: 'childList', removedNodes: [n21.lastChild!], previousSibling: n21.firstChild! },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n21, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n21, { childList: true });
				(function () {
					n21.normalize();
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.insertBefore: addition mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n30 = document.getElementById('n30')!;
			let d30 = document.getElementById('d30')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', addedNodes: [d30], nextSibling: n30.firstChild! },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n30, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n30, { childList: true });
				(function () {
					n30.insertBefore(d30, n30.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.insertBefore: removal mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n31 = document.getElementById('n31')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n31.firstChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n31, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n31, { childList: true });
				(function () {
					dummies.insertBefore(n31.firstChild!, dummies.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.insertBefore: removal and addition mutations',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n32 = document.getElementById('n32')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					removedNodes: [n32.firstChild!.nextSibling!],
					previousSibling: n32.firstChild!,
					nextSibling: n32.lastChild!,
				},
				{
					type: 'childList',
					addedNodes: [n32.firstChild!.nextSibling!],
					nextSibling: n32.firstChild!,
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n32, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n32, { childList: true });
				(function () {
					n32.insertBefore(n32.firstChild!.nextSibling!, n32.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.insertBefore: fragment addition mutations',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n33 = document.getElementById('n33')!;
			let f33 = createFragment(document);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					addedNodes: [f33.firstChild!, f33.lastChild!],
					nextSibling: n33.firstChild!,
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n33, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n33, { childList: true });
				(function () {
					n33.insertBefore(f33, n33.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.insertBefore: fragment removal mutations',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n34 = document.getElementById('n34')!;
			let f34 = createFragment(document);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [f34.firstChild!, f34.lastChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, f34, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(f34, { childList: true });
				(function () {
					n34.insertBefore(f34, n34.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.insertBefore: last child addition mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n35 = document.getElementById('n35')!;
			let d35 = document.getElementById('d35')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', addedNodes: [d35], previousSibling: n35.firstChild! },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n35, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n35, { childList: true });
				(function () {
					n35.insertBefore(d35, null);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.appendChild: addition mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n40 = document.getElementById('n40')!;
			let d40 = document.getElementById('d40')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', addedNodes: [d40], previousSibling: n40.firstChild! },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n40, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n40, { childList: true });
				(function () {
					n40.appendChild(d40);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.appendChild: removal mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n41 = document.getElementById('n41')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n41.firstChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n41, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n41, { childList: true });
				(function () {
					dummies.appendChild(n41.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.appendChild: removal and addition mutations',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n42 = document.getElementById('n42')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					removedNodes: [n42.firstChild!.nextSibling!],
					previousSibling: n42.firstChild!,
					nextSibling: n42.lastChild!,
				},
				{
					type: 'childList',
					addedNodes: [n42.firstChild!.nextSibling!],
					previousSibling: n42.lastChild!,
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n42, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n42, { childList: true });
				(function () {
					n42.appendChild(n42.firstChild!.nextSibling!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.appendChild: fragment addition mutations',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n43 = document.getElementById('n43')!;
			let f43 = createFragment(document);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					addedNodes: [f43.firstChild!, f43.lastChild!],
					previousSibling: n43.firstChild!,
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n43, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n43, { childList: true });
				(function () {
					n43.appendChild(f43);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.appendChild: fragment removal mutations',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n44 = document.getElementById('n44')!;
			let f44 = createFragment(document);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [f44.firstChild!, f44.lastChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, f44, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(f44, { childList: true });
				(function () {
					n44.appendChild(f44);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.appendChild: addition outside document tree mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n45 = document.createElement('p');
			let d45 = document.createElement('span');

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', addedNodes: [d45] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n45, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n45, { childList: true });
				(function () {
					n45.appendChild(d45);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.replaceChild: replacement mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n50 = document.getElementById('n50')!;
			let d50 = document.getElementById('d50')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n50.firstChild!], addedNodes: [d50] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n50, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n50, { childList: true });
				(function () {
					n50.replaceChild(d50, n50.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.replaceChild: removal mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n51 = document.getElementById('n51')!;
			let d51 = document.getElementById('d51')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n51.firstChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n51, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n51, { childList: true });
				(function () {
					d51.parentNode!.replaceChild(n51.firstChild!, d51);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.replaceChild: internal replacement mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n52 = document.getElementById('n52')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n52.lastChild!], previousSibling: n52.firstChild! },
				{ type: 'childList', removedNodes: [n52.firstChild!], addedNodes: [n52.lastChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n52, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n52, { childList: true });
				(function () {
					n52.replaceChild(n52.lastChild!, n52.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.replaceChild: self internal replacement mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n53 = document.getElementById('n53')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n53.firstChild!] },
				{ type: 'childList', addedNodes: [n53.firstChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n53, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n53, { childList: true });
				(function () {
					n53.replaceChild(n53.firstChild!, n53.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList ParentNode.replaceChildren: move an existing child',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n110 = document.getElementById('n110')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					removedNodes: [n110.childNodes[0]!, n110.childNodes[1]!, n110.childNodes[2]!],
					addedNodes: [n110.childNodes[1]!],
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n110, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n110, { childList: true });
				(function () {
					n110.replaceChildren(n110.childNodes[1]!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList ParentNode.replaceChildren: self replacement of only child',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n111 = document.getElementById('n111')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n111.firstChild!], addedNodes: [n111.firstChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n111, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n111, { childList: true });
				(function () {
					n111.replaceChildren(n111.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Node.removeChild: removal mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n60 = document.getElementById('n60')!;

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n60.firstChild!] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n60, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n60, { childList: true });
				(function () {
					n60.removeChild(n60.firstChild!);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Range.deleteContents: child removal mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n70 = document.getElementById('n70')!;
			let r70: Range;

			r70 = document.createRange();
			r70.setStartBefore(n70.firstChild!);
			r70.setEndAfter(n70.firstChild!);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n70.firstChild!], nextSibling: n70.lastChild! },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n70, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n70, { childList: true });
				(function () {
					r70.deleteContents();
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Range.deleteContents: child and data removal mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n71 = document.getElementById('n71')!;
			let r71: Range;

			n71.appendChild(document.createTextNode('NNN'));
			n71.appendChild(document.createTextNode('NGED'));
			r71 = document.createRange();
			r71.setStart(n71.firstChild!, 4);
			r71.setEnd(n71.lastChild!, 1);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					removedNodes: [n71.firstChild!.nextSibling!],
					previousSibling: n71.firstChild!,
					nextSibling: n71.lastChild!,
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n71, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n71, { childList: true });
				(function () {
					r71.deleteContents();
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Range.extractContents: child removal mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n80 = document.getElementById('n80')!;
			let r80: Range;

			r80 = document.createRange();
			r80.setStartBefore(n80.firstChild!);
			r80.setEndAfter(n80.firstChild!);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n80.firstChild!], nextSibling: n80.lastChild! },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n80, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n80, { childList: true });
				(function () {
					r80.extractContents();
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Range.extractContents: child and data removal mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n81 = document.getElementById('n81')!;
			let r81: Range;

			n81.appendChild(document.createTextNode('NNN'));
			n81.appendChild(document.createTextNode('NGED'));
			r81 = document.createRange();
			r81.setStart(n81.firstChild!, 4);
			r81.setEnd(n81.lastChild!, 1);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					removedNodes: [n81.firstChild!.nextSibling!],
					previousSibling: n81.firstChild!,
					nextSibling: n81.lastChild!,
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n81, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n81, { childList: true });
				(function () {
					r81.extractContents();
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Range.insertNode: child insertion mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n90 = document.getElementById('n90')!;
			let f90 = document.createTextNode('NG');
			let r90: Range;

			r90 = document.createRange();
			r90.setStartAfter(n90.firstChild!);
			r90.setEndBefore(n90.lastChild!);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					addedNodes: [f90],
					previousSibling: n90.firstChild!,
					nextSibling: n90.lastChild!,
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n90, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n90, { childList: true });
				(function () {
					r90.insertNode(f90);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Range.insertNode: children insertion mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n91 = document.getElementById('n91')!;
			let f91 = document.createTextNode('NG');
			let r91: Range;

			n91.appendChild(document.createTextNode('D'));
			r91 = document.createRange();
			r91.setStart(n91.firstChild!, 3);
			r91.setEnd(n91.lastChild!, 0);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{
					type: 'childList',
					addedNodes: function () {
						return [n91.lastChild!.previousSibling!];
					},
					previousSibling: n91.firstChild!,
					nextSibling: n91.lastChild!,
				},
				{
					type: 'childList',
					addedNodes: [f91],
					previousSibling: n91.firstChild!,
					nextSibling: function () {
						return n91.lastChild!.previousSibling!;
					},
				},
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n91, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n91, { childList: true });
				(function () {
					r91.insertNode(f91);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'childList Range.surroundContents: children removal and addition mutation',
		async ({ document, MutationObserver, step, cleanup }) => {
			let dummies = document.getElementById('dummies')!;

			let n100 = document.getElementById('n100')!;
			let f100 = document.createElement('span');
			let r100: Range;

			r100 = document.createRange();
			r100.setStartBefore(n100.firstChild!);
			r100.setEndAfter(n100.lastChild!);

			const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
				{ type: 'childList', removedNodes: [n100.firstChild!], nextSibling: n100.lastChild! },
				{ type: 'childList', removedNodes: [n100.lastChild!] },
				{ type: 'childList', addedNodes: [f100] },
			];
			await new Promise<void>((resolve) => {
				const observer = new MutationObserver((mrl, obs) => {
					step(() => {
						checkRecords(expect, n100, mrl, mutationRecordSequence);
					})();
					resolve();
				});
				cleanup(() => observer.disconnect());
				observer.observe(n100, { childList: true });
				(function () {
					r100.surroundContents(f100);
				})();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
