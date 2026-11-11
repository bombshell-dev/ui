import type { CompatibilityContext } from '../../../shared/context.ts';
import { checkRecords } from './mutationobservers.js.ts';

export function register(context: CompatibilityContext): void {
	{
		const markup2 = `<!DOCTYPE HTML>
<meta charset=utf-8>
<title>MutationObservers: characterData mutations</title>



<h1>MutationObservers: characterData mutations</h1>
<div id="log"></div>

<section style="display: none">

<p id='n'>text content</p>

<p id='n00'>text content</p>

<p id='n10'>CHAN</p>
<p id='n11'>CHANGED</p>
<p id='n12'>CHANGED</p>

<p id='n20'>CHGED</p>
<p id='n21'>CHANGED</p>
<p id='n22'>CHANGED</p>

<p id='n30'>CCCHANGED</p>
<p id='n31'>CHANGED</p>

<p id='n40'>CCCHANGED</p>
<p id='n41'>CHANGED</p>

<p id="n50"></p>

<p id="n60"><!-- data --></p>

<p id='n70'>CHANN</p>
<p id='n71'>CHANN</p>

<p id='n80'>CHANN</p>
<p id='n81'>CHANN</p>

<p id='n90'>CHANN</p>

</section>


`;
		const { expect } = context.runner;
		context.test(
			'characterData Text.data: simple mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n00 = document.getElementById('n00')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'text content' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n00, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n00, { characterData: true, characterDataOldValue: true });
					(function () {
						n00.data = 'CHANGED';
					})();
				});
			},
			{
				document: {
					contentType: 'text/html',
					content: markup2,
				},
			},
		);
		context.test(
			'characterData/characterDataOldValue alone Text.data: simple mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n90 = document.getElementById('n90')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHANN' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n90, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n90, { characterDataOldValue: true });
					(function () {
						n90.data = 'CHANGED';
					})();
				});
			},
			{
				document: {
					contentType: 'text/html',
					content: markup2,
				},
			},
		);
	}
	{
		const markup = `<!DOCTYPE HTML>
<meta charset=utf-8>
<title>MutationObservers: characterData mutations</title>



<h1>MutationObservers: characterData mutations</h1>
<div id="log"></div>

<section style="display: none">

<p id='n'>text content</p>

<p id='n00'>text content</p>

<p id='n10'>CHAN</p>
<p id='n11'>CHANGED</p>
<p id='n12'>CHANGED</p>

<p id='n20'>CHGED</p>
<p id='n21'>CHANGED</p>
<p id='n22'>CHANGED</p>

<p id='n30'>CCCHANGED</p>
<p id='n31'>CHANGED</p>

<p id='n40'>CCCHANGED</p>
<p id='n41'>CHANGED</p>

<p id="n50"></p>

<p id="n60"><!-- data --></p>

<p id='n70'>CHANN</p>
<p id='n71'>CHANN</p>

<p id='n80'>CHANN</p>
<p id='n81'>CHANN</p>

<p id='n90'>CHANN</p>

</section>


`;
		const { expect } = context.runner;
		context.test(
			'characterData Text.data: simple mutation without oldValue',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n = document.getElementById('n')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n, { characterData: true });
					(function () {
						n.data = 'NEW VALUE';
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
			'characterData Text.appendData: simple mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n10 = document.getElementById('n10')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHAN' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n10, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n10, { characterData: true, characterDataOldValue: true });
					(function () {
						n10.appendData('GED');
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
			'characterData Text.appendData: empty string mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n11 = document.getElementById('n11')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n11, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n11, { characterData: true, characterDataOldValue: true });
					(function () {
						n11.appendData('');
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
			'characterData Text.appendData: null string mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n12 = document.getElementById('n12')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n12, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n12, { characterData: true, characterDataOldValue: true });
					(function () {
						n12.appendData(null as unknown as string);
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
			'characterData Text.insertData: simple mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n20 = document.getElementById('n20')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n20, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n20, { characterData: true, characterDataOldValue: true });
					(function () {
						n20.insertData(2, 'AN');
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
			'characterData Text.insertData: empty string mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n21 = document.getElementById('n21')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n21, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n21, { characterData: true, characterDataOldValue: true });
					(function () {
						n21.insertData(2, '');
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
			'characterData Text.insertData: null string mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n22 = document.getElementById('n22')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n22, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n22, { characterData: true, characterDataOldValue: true });
					(function () {
						n22.insertData(2, null as unknown as string);
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
			'characterData Text.deleteData: simple mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n30 = document.getElementById('n30')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CCCHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n30, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n30, { characterData: true, characterDataOldValue: true });
					(function () {
						n30.deleteData(0, 2);
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
			'characterData Text.deleteData: empty mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n31 = document.getElementById('n31')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHANGED' },
					{ type: 'characterData', oldValue: 'CHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n31, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n31, { characterData: true, characterDataOldValue: true });
					(function () {
						n31.deleteData(0, 0);
						n31.data = 'n31';
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
			'characterData Text.replaceData: simple mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n40 = document.getElementById('n40')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CCCHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n40, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n40, { characterData: true, characterDataOldValue: true });
					(function () {
						n40.replaceData(0, 2, 'CH');
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
			'characterData Text.replaceData: empty mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n41 = document.getElementById('n41')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n41, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n41, { characterData: true, characterDataOldValue: true });
					(function () {
						n41.replaceData(0, 0, 'CH');
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
			'characterData ProcessingInstruction: data mutations',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n50 = document.createProcessingInstruction('processing', 'data');
				document.getElementById('n50')!.appendChild(n50);

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'data' },
					{ type: 'characterData', oldValue: 'CHANGED' },
					{ type: 'characterData', oldValue: 'CHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n50, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n50, { characterData: true, characterDataOldValue: true });
					(function () {
						n50.data = 'CHANGED';
						n50.deleteData(0, 0);
						n50.replaceData(0, 2, 'CH');
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
			'characterData Comment: data mutations',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n60 = document.getElementById('n60')!.firstChild! as CharacterData;

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: ' data ' },
					{ type: 'characterData', oldValue: 'CHANGED' },
					{ type: 'characterData', oldValue: 'CHANGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n60, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n60, { characterData: true, characterDataOldValue: true });
					(function () {
						n60.data = 'CHANGED';
						n60.deleteData(0, 0);
						n60.replaceData(0, 2, 'CH');
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
			'characterData Range.deleteContents: child and data removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n70 = document.getElementById('n70')!;
				let r70: Range;

				n70.appendChild(document.createTextNode('NNN'));
				n70.appendChild(document.createTextNode('NGED'));
				r70 = document.createRange();
				r70.setStart(n70.firstChild!, 4);
				r70.setEnd(n70.lastChild!, 1);

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHANN' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n70.firstChild!, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n70.firstChild!, { characterData: true, characterDataOldValue: true });
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
			'characterData Range.deleteContents: child and data removal mutation (2)',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n71 = document.getElementById('n71')!;
				let r71: Range;

				n71.appendChild(document.createTextNode('NNN'));
				n71.appendChild(document.createTextNode('NGED'));
				r71 = document.createRange();
				r71.setStart(n71.firstChild!, 4);
				r71.setEnd(n71.lastChild!, 1);

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'NGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n71.lastChild!, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n71.lastChild!, { characterData: true, characterDataOldValue: true });
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
			'characterData Range.extractContents: child and data removal mutation',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n80 = document.getElementById('n80')!;
				let r80: Range;

				n80.appendChild(document.createTextNode('NNN'));
				n80.appendChild(document.createTextNode('NGED'));
				r80 = document.createRange();
				r80.setStart(n80.firstChild!, 4);
				r80.setEnd(n80.lastChild!, 1);

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'CHANN' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n80.firstChild!, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n80.firstChild!, { characterData: true, characterDataOldValue: true });
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
			'characterData Range.extractContents: child and data removal mutation (2)',
			async ({ document, MutationObserver, step, cleanup }) => {
				let n81 = document.getElementById('n81')!;
				let r81: Range;

				n81.appendChild(document.createTextNode('NNN'));
				n81.appendChild(document.createTextNode('NGED'));
				r81 = document.createRange();
				r81.setStart(n81.firstChild!, 4);
				r81.setEnd(n81.lastChild!, 1);

				const mutationRecordSequence: Parameters<typeof checkRecords>[3] = [
					{ type: 'characterData', oldValue: 'NGED' },
				];
				await new Promise<void>((resolve) => {
					const observer = new MutationObserver((mrl, obs) => {
						step(() => {
							checkRecords(expect, n81.lastChild!, mrl, mutationRecordSequence);
						})();
						resolve();
					});
					cleanup(() => observer.disconnect());
					observer.observe(n81.lastChild!, { characterData: true, characterDataOldValue: true });
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
	}
}
