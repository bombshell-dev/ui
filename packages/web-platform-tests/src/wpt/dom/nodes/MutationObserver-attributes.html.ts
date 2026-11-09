import type { CompatibilityContext } from '../../../shared/context.ts';
import { checkRecords } from './mutationobservers.js.ts';

export function register(context: CompatibilityContext): void {
	{
		const markup = `<!DOCTYPE HTML>
<meta charset=utf-8>
<title>MutationObservers: attributes mutations</title>



<h1>MutationObservers: attributes mutations</h1>
<div id="log"></div>

<section style="display: none">
<p id='n'></p>

<p id='n00'></p>
<p id='n01'></p>
<p id='n02'></p>
<p id='n03'></p>
<input id="n04" type="text">

<p id='n10'></p>
<p id='n11'></p>
<p id='n12' class='c01'></p>
<p id='n13' class='c01 c02'></p>

<p id='n20'></p>
<p id='n21'></p>
<p id='n22'></p>
<p id='n23'></p>
<p id='n24' class="c01 c02"></p>

<p id='n30' class="c01 c02"></p>
<p id='n31' class="c01 c02"></p>
<p id='n32' class="c01 c02"></p>

<p id='n40' class="c01 c02"></p>
<p id='n41' class="c01 c02"></p>
<p id='n42' class="c01 c02"></p>
<p id='n43' class="c01 c02"></p>
<p id='n44' class="c01 c02"></p>
<p id='n45' class="c01 c02"></p>

<p id='n50' class="c01 c02"></p>
<p id='n51'></p>

<p id='n60'></p>
<p id='n61' class="c01"></p>
<p id='n62'></p>

<p id='n70' class="c01"></p>
<p id='n71'></p>
<input id="n72" type="text">

<p id='n80'></p>
<p id='n81'></p>

<p id='n90'></p>
<p id='n91'></p>
<p id='n92'></p>

<p id='n1000'></p>
<p id='n1001' class='c01'></p>

<p id='n2000'></p>
<p id='n2001' class='c01'></p>

<p id='n3000'></p>

</section>


`;
		const { expect } = context.runner;
		context.test(
			'attributes/attributeFilter Element.id/Element.className: update mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n1000 = document.getElementById('n1000')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n1000', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n1000, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n1000, {
						attributes: true,
						attributeOldValue: true,
						attributeFilter: ['id'],
					});
					(function () {
						n1000.id = 'abc';
						n1000.className = 'c01';
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
			'attributes/attributeFilter Element.id/Element.className: multiple filter update mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n1001 = document.getElementById('n1001')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n1001', attributeName: 'id' },
					{ type: 'attributes', oldValue: 'c01', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n1001, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n1001, {
						attributes: true,
						attributeOldValue: true,
						attributeFilter: ['id', 'class'],
					});
					(function () {
						n1001.id = 'abc';
						n1001.className = 'c02';
						n1001.setAttribute('lang', 'fr');
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
			'attributeFilter alone Element.id/Element.className: multiple filter update mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n2001 = document.getElementById('n2001')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', attributeName: 'id' },
					{ type: 'attributes', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n2001, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n2001, { attributeFilter: ['id', 'class'] });
					(function () {
						n2001.id = 'abcd';
						n2001.className = 'c02';
						n2001.setAttribute('lang', 'fr');
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
	{
		const markup1 = `<!DOCTYPE HTML>
<meta charset=utf-8>
<title>MutationObservers: attributes mutations</title>



<h1>MutationObservers: attributes mutations</h1>
<div id="log"></div>

<section style="display: none">
<p id='n'></p>

<p id='n00'></p>
<p id='n01'></p>
<p id='n02'></p>
<p id='n03'></p>
<input id="n04" type="text">

<p id='n10'></p>
<p id='n11'></p>
<p id='n12' class='c01'></p>
<p id='n13' class='c01 c02'></p>

<p id='n20'></p>
<p id='n21'></p>
<p id='n22'></p>
<p id='n23'></p>
<p id='n24' class="c01 c02"></p>

<p id='n30' class="c01 c02"></p>
<p id='n31' class="c01 c02"></p>
<p id='n32' class="c01 c02"></p>

<p id='n40' class="c01 c02"></p>
<p id='n41' class="c01 c02"></p>
<p id='n42' class="c01 c02"></p>
<p id='n43' class="c01 c02"></p>
<p id='n44' class="c01 c02"></p>
<p id='n45' class="c01 c02"></p>

<p id='n50' class="c01 c02"></p>
<p id='n51'></p>

<p id='n60'></p>
<p id='n61' class="c01"></p>
<p id='n62'></p>

<p id='n70' class="c01"></p>
<p id='n71'></p>
<input id="n72" type="text">

<p id='n80'></p>
<p id='n81'></p>

<p id='n90'></p>
<p id='n91'></p>
<p id='n92'></p>

<p id='n1000'></p>
<p id='n1001' class='c01'></p>

<p id='n2000'></p>
<p id='n2001' class='c01'></p>

<p id='n3000'></p>

</section>


`;
		const { expect } = context.runner;
		context.test(
			'attributes Element.id: update mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n00 = document.getElementById('n00')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n00', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n00, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n00, { attributes: true, attributeOldValue: true });
					(function () {
						n00.id = 'n000';
					})();
				});
			},
			{
				document: {
					contentType: 'text/html',
					content: markup1,
				},
			},
		);
		context.test(
			'attributeOldValue alone Element.id: update mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n2000 = document.getElementById('n2000')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n2000', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n2000, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n2000, { attributeOldValue: true });
					(function () {
						n2000.id = 'abc';
					})();
				});
			},
			{
				document: {
					contentType: 'text/html',
					content: markup1,
				},
			},
		);
	}
	{
		const markup = `<!DOCTYPE HTML>
<meta charset=utf-8>
<title>MutationObservers: attributes mutations</title>



<h1>MutationObservers: attributes mutations</h1>
<div id="log"></div>

<section style="display: none">
<p id='n'></p>

<p id='n00'></p>
<p id='n01'></p>
<p id='n02'></p>
<p id='n03'></p>
<input id="n04" type="text">

<p id='n10'></p>
<p id='n11'></p>
<p id='n12' class='c01'></p>
<p id='n13' class='c01 c02'></p>

<p id='n20'></p>
<p id='n21'></p>
<p id='n22'></p>
<p id='n23'></p>
<p id='n24' class="c01 c02"></p>

<p id='n30' class="c01 c02"></p>
<p id='n31' class="c01 c02"></p>
<p id='n32' class="c01 c02"></p>

<p id='n40' class="c01 c02"></p>
<p id='n41' class="c01 c02"></p>
<p id='n42' class="c01 c02"></p>
<p id='n43' class="c01 c02"></p>
<p id='n44' class="c01 c02"></p>
<p id='n45' class="c01 c02"></p>

<p id='n50' class="c01 c02"></p>
<p id='n51'></p>

<p id='n60'></p>
<p id='n61' class="c01"></p>
<p id='n62'></p>

<p id='n70' class="c01"></p>
<p id='n71'></p>
<input id="n72" type="text">

<p id='n80'></p>
<p id='n81'></p>

<p id='n90'></p>
<p id='n91'></p>
<p id='n92'></p>

<p id='n1000'></p>
<p id='n1001' class='c01'></p>

<p id='n2000'></p>
<p id='n2001' class='c01'></p>

<p id='n3000'></p>

</section>


`;
		const { expect } = context.runner;
		context.test(
			'attributes Element.id: update, no oldValue, mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n = document.getElementById('n')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n, { attributes: true });
					(function () {
						n.id = 'n000';
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
			'attributes Element.id: empty string update mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n01 = document.getElementById('n01')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n01', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n01, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n01, { attributes: true, attributeOldValue: true });
					(function () {
						n01.id = '';
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
			'attributes Element.id: same value mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n02 = document.getElementById('n02')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n02', attributeName: 'id' },
					{ type: 'attributes', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n02, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n02, { attributes: true, attributeOldValue: true });
					(function () {
						n02.id = 'n02';
						n02.setAttribute('class', 'c01');
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
			'attributes Element.unknown: IDL attribute no mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n03 = document.getElementById('n03')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n03', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n03, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n03, { attributes: true, attributeOldValue: true });
					(function () {
						(n03 as HTMLElement & { unknown: string }).unknown = 'c02';
						n03.id = 'n030';
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
			'attributes HTMLInputElement.type: type update mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n04 = document.getElementById('n04')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'text', attributeName: 'type' },
					{ type: 'attributes', oldValue: 'n04', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n04, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n04, { attributes: true, attributeOldValue: true });
					(function () {
						(n04 as HTMLInputElement).type = 'unknown';
						n04.id = 'n040';
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
			'attributes Element.className: new value mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n10 = document.getElementById('n10')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n10, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n10, { attributes: true, attributeOldValue: true });
					(function () {
						n10.className = 'c01';
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
			'attributes Element.className: empty string update mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n11 = document.getElementById('n11')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n11, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n11, { attributes: true, attributeOldValue: true });
					(function () {
						n11.className = '';
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
			'attributes Element.className: same value mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n12 = document.getElementById('n12')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n12, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n12, { attributes: true, attributeOldValue: true });
					(function () {
						n12.className = 'c01';
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
			'attributes Element.className: same multiple values mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n13 = document.getElementById('n13')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n13, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n13, { attributes: true, attributeOldValue: true });
					(function () {
						n13.className = 'c01 c02';
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
			'attributes Element.classList.add: single token addition mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n20 = document.getElementById('n20')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n20, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n20, { attributes: true, attributeOldValue: true });
					(function () {
						n20.classList.add('c01');
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
			'attributes Element.classList.add: multiple tokens addition mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n21 = document.getElementById('n21')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n21, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n21, { attributes: true, attributeOldValue: true });
					(function () {
						n21.classList.add('c01', 'c02', 'c03');
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
			'attributes Element.classList.add: syntax err/no mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n22 = document.getElementById('n22')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n22', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n22, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n22, { attributes: true, attributeOldValue: true });
					(function () {
						try {
							n22.classList.add('c01', '', 'c03');
						} catch (e) {}
						n22.id = 'n220';
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
			'attributes Element.classList.add: invalid character/no mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n23 = document.getElementById('n23')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n23', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n23, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n23, { attributes: true, attributeOldValue: true });
					(function () {
						try {
							n23.classList.add('c01', 'c 02', 'c03');
						} catch (e) {}
						n23.id = 'n230';
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
			'attributes Element.classList.add: same value mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n24 = document.getElementById('n24')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
					{ type: 'attributes', oldValue: 'n24', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n24, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n24, { attributes: true, attributeOldValue: true });
					(function () {
						n24.classList.add('c02');
						n24.id = 'n240';
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
			'attributes Element.classList.remove: single token removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n30 = document.getElementById('n30')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n30, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n30, { attributes: true, attributeOldValue: true });
					(function () {
						n30.classList.remove('c01');
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
			'attributes Element.classList.remove: multiple tokens removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n31 = document.getElementById('n31')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n31, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n31, { attributes: true, attributeOldValue: true });
					(function () {
						n31.classList.remove('c01', 'c02');
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
			'attributes Element.classList.remove: missing token removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n32 = document.getElementById('n32')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
					{ type: 'attributes', oldValue: 'n32', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n32, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n32, { attributes: true, attributeOldValue: true });
					(function () {
						n32.classList.remove('c03');
						n32.id = 'n320';
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
			'attributes Element.classList.toggle: token removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n40 = document.getElementById('n40')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n40, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n40, { attributes: true, attributeOldValue: true });
					(function () {
						n40.classList.toggle('c01');
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
			'attributes Element.classList.toggle: token addition mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n41 = document.getElementById('n41')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n41, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n41, { attributes: true, attributeOldValue: true });
					(function () {
						n41.classList.toggle('c03');
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
			'attributes Element.classList.toggle: forced token removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n42 = document.getElementById('n42')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n42, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n42, { attributes: true, attributeOldValue: true });
					(function () {
						n42.classList.toggle('c01', false);
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
			'attributes Element.classList.toggle: forced missing token removal no mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n43 = document.getElementById('n43')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n43', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n43, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n43, { attributes: true, attributeOldValue: true });
					(function () {
						n43.classList.toggle('c03', false);
						n43.id = 'n430';
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
			'attributes Element.classList.toggle: forced existing token addition no mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n44 = document.getElementById('n44')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n44', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n44, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n44, { attributes: true, attributeOldValue: true });
					(function () {
						n44.classList.toggle('c01', true);
						n44.id = 'n440';
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
			'attributes Element.classList.toggle: forced token addition mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n45 = document.getElementById('n45')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n45, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n45, { attributes: true, attributeOldValue: true });
					(function () {
						n45.classList.toggle('c03', true);
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
			'attributes Element.attributes.value: update mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n50 = document.getElementById('n50')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01 c02', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n50, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n50, { attributes: true, attributeOldValue: true });
					(function () {
						for (let i = 0; i < n50.attributes.length; i++) {
							let attr = n50.attributes[i]!;
							if (attr.localName === 'class') {
								attr.value = 'c03';
							}
						}
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
			'attributes Element.attributes.value: same id mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n51 = document.getElementById('n51')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n51', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n51, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n51, { attributes: true, attributeOldValue: true });
					(function () {
						n51.attributes[0]!.value = 'n51';
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
			'attributes Element.setAttribute: id mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n60 = document.getElementById('n60')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n60', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n60, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n60, { attributes: true, attributeOldValue: true });
					(function () {
						n60.setAttribute('id', 'n601');
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
			'attributes Element.setAttribute: same class mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n61 = document.getElementById('n61')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n61, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n61, { attributes: true, attributeOldValue: true });
					(function () {
						n61.setAttribute('class', 'c01');
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
			'attributes Element.setAttribute: classname mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n62 = document.getElementById('n62')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', attributeName: 'classname' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n62, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n62, { attributes: true, attributeOldValue: true });
					(function () {
						n62.setAttribute('classname', 'c01');
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
			'attributes Element.removeAttribute: removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n70 = document.getElementById('n70')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'c01', attributeName: 'class' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n70, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n70, { attributes: true, attributeOldValue: true });
					(function () {
						n70.removeAttribute('class');
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
			'attributes Element.removeAttribute: removal no mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n71 = document.getElementById('n71')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n71', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n71, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n71, { attributes: true, attributeOldValue: true });
					(function () {
						n71.removeAttribute('class');
						n71.id = 'n710';
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
			'childList HTMLInputElement.removeAttribute: type removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n72 = document.getElementById('n72')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'text', attributeName: 'type' },
					{ type: 'attributes', oldValue: 'n72', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n72, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n72, { attributes: true, attributeOldValue: true });
					(function () {
						n72.removeAttribute('type');
						n72.id = 'n720';
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
			'attributes Element.setAttributeNS: creation mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n80 = document.getElementById('n80')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{
						type: 'attributes',
						attributeName: 'private',
						attributeNamespace: 'http://example.org/',
					},
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n80, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n80, { attributes: true, attributeOldValue: true });
					(function () {
						n80.setAttributeNS('http://example.org/', 'private', '42');
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
			'attributes Element.setAttributeNS: prefixed attribute creation mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n81 = document.getElementById('n81')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{
						type: 'attributes',
						attributeName: 'lang',
						attributeNamespace: 'http://www.w3.org/XML/1998/namespace',
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
					observer.observe(n81, { attributes: true, attributeOldValue: true });
					(function () {
						n81.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:lang', '42');
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
			'attributes Element.removeAttributeNS: removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n90 = document.getElementById('n90')!;
				n90.setAttributeNS('http://example.org/', 'private', '42');

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{
						type: 'attributes',
						oldValue: '42',
						attributeName: 'private',
						attributeNamespace: 'http://example.org/',
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
					observer.observe(n90, { attributes: true, attributeOldValue: true });
					(function () {
						n90.removeAttributeNS('http://example.org/', 'private');
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
			'attributes Element.removeAttributeNS: removal no mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n91 = document.getElementById('n91')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n91', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n91, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n91, { attributes: true, attributeOldValue: true });
					(function () {
						n91.removeAttributeNS('http://example.org/', 'private');
						n91.id = 'n910';
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
			'attributes Element.removeAttributeNS: prefixed attribute removal no mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n92 = document.getElementById('n92')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', oldValue: 'n92', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n92, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n92, { attributes: true, attributeOldValue: true });
					(function () {
						n92.removeAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:lang');
						n92.id = 'n920';
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
			'childList false: no childList mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n3000 = document.getElementById('n3000')!;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'attributes', attributeName: 'id' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n3000, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n3000, { subtree: true, childList: false, attributes: true });
					(function () {
						n3000.textContent = 'CHANGED';
						n3000.id = 'abc';
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
}
