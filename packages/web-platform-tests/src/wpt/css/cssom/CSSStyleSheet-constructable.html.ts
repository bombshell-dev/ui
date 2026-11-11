import type { CompatibilityContext } from '../../../shared/context.ts';

const markup1 = `<!DOCTYPE html>
<title>CSSStyleSheet constructor and adoptedStyleSheets</title>





<section id="firstSection">
  <div>
    <span class="green"></span>
    <span class="red"></span>
    <span class="blue"></span>
    <span class="white"></span>
    <span class="yellow"></span>
  </div>
</section>
<section id="shadowHost"></section>
<section id="thirdSection"></section>



<div id="divNonConstructed" class="nonConstructed">
</div>


`;

function prepare(document: Document, CSSStyleSheet: typeof globalThis.CSSStyleSheet) {
	const greenStyleText = '.green { color: green; }';
	const redStyleTexts = ['.red { color: red; }', '.red + span + span { color: red; }'];
	const blueStyleTexts = ['.blue { color: blue; }', '.blue + span + span { color: blue; }'];
	const whiteStyleText = '* { color: white; }';
	const yellowStyleText = '.yellow { color: yellow; }';

	const firstDiv = document.querySelector('#firstSection > div')! as HTMLElement;
	const secondDiv = firstDiv.cloneNode(true) as HTMLElement as HTMLElement;
	const shadowHost = document.querySelector('#shadowHost')!;
	const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
	shadowRoot.appendChild(secondDiv);

	const greenSpan = firstDiv.children[0]!;
	const redSpan = firstDiv.children[1]!;
	const blueSpan = firstDiv.children[2]!;
	const whiteSpan = firstDiv.children[3]!;
	const yellowSpan = firstDiv.children[4]!;
	const greenShadowSpan = secondDiv.children[0]!;
	const redShadowSpan = secondDiv.children[1]!;
	const blueShadowSpan = secondDiv.children[2]!;
	const whiteShadowSpan = secondDiv.children[3]!;
	const yellowShadowSpan = secondDiv.children[4]!;

	const thirdSection = document.getElementById('thirdSection')!;
	const divNonConstructed = document.getElementById('divNonConstructed')!;
	const shadowRootNonConstructed = divNonConstructed.attachShadow({ mode: 'open' });
	const nonConstructedStyle = document.createElement('style');
	shadowRootNonConstructed.appendChild(nonConstructedStyle);
	nonConstructedStyle.sheet!.insertRule('.nonConstructed { color: red; }', 0);
	const nonConstructedStyleSheet = nonConstructedStyle.sheet!;

	function createAllSheetsPromise() {
		const greenSheet = new CSSStyleSheet();
		const redSheet = new CSSStyleSheet({ media: 'screen, print' });
		const blueSheet = new CSSStyleSheet({ disabled: true });
		const whiteSheet = new CSSStyleSheet({ disabled: true });
		const yellowSheet = new CSSStyleSheet({ disabled: false });

		const greenPromise = greenSheet.replace(greenStyleText);
		const redPromise = redSheet.replace(redStyleTexts[0]! + redStyleTexts[1]!);
		const bluePromise = blueSheet.replace(blueStyleTexts[0]! + blueStyleTexts[1]!);
		const whitePromise = whiteSheet.replace(whiteStyleText);
		const yellowPromise = yellowSheet.replace(yellowStyleText);
		return [greenPromise, redPromise, bluePromise, whitePromise, yellowPromise] as const;
	}

	function attachShadowDiv(host: HTMLElement) {
		const shadowRoot = host.attachShadow({ mode: 'open' });
		const shadowDiv = document.createElement('div');
		shadowRoot.appendChild(shadowDiv);
		return shadowDiv;
	}

	const import_text = '@import url("support/constructable-import.css");';
	return {
		greenStyleText,
		redStyleTexts,
		blueStyleTexts,
		whiteStyleText,
		yellowStyleText,
		firstDiv,
		secondDiv,
		shadowHost,
		shadowRoot,
		greenSpan,
		redSpan,
		blueSpan,
		whiteSpan,
		yellowSpan,
		greenShadowSpan,
		redShadowSpan,
		blueShadowSpan,
		whiteShadowSpan,
		yellowShadowSpan,
		thirdSection,
		divNonConstructed,
		nonConstructedStyleSheet,
		createAllSheetsPromise,
		attachShadowDiv,
		import_text,
	};
}

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'document.adoptedStyleSheets should initially have length 0.',
		({ document }) => {
			const redStyleTexts = ['.red { color: red; }', '.red + span + span { color: red; }'] as const;

			expect(document.adoptedStyleSheets.length).toBe(0);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'new CSSStyleSheet produces empty CSSStyleSheet',
		({ CSSStyleSheet }) => {
			const redStyleTexts = ['.red { color: red; }', '.red + span + span { color: red; }'] as const;

			const sheet = new CSSStyleSheet({ disabled: true, media: 'screen, print' });
			expect(
				sheet.title,
				'The title attribute must return the title or null if title is the empty string',
			).toBe(null);
			expect(sheet.ownerNode).toBe(null);
			expect(sheet.ownerRule).toBe(null);
			expect(sheet.media.length).toBe(2);
			expect(sheet.media.item(0)).toBe('screen');
			expect(sheet.media.item(1)).toBe('print');
			expect(sheet.disabled).toBe(true);
			expect(sheet.cssRules.length).toBe(0);

			sheet.insertRule(redStyleTexts[0]);
			expect(sheet.cssRules.length).toBe(1);
			expect(sheet.cssRules[0]!.cssText).toBe(redStyleTexts[0]);

			sheet.insertRule(redStyleTexts[1]);
			expect(sheet.cssRules.length).toBe(2);
			expect(sheet.cssRules[0]!.cssText).toBe(redStyleTexts[1]);

			const sheet2 = new CSSStyleSheet({});
			expect(
				sheet2.title,
				'The title attribute must return the title or null if title is the empty string',
			).toBe(null);
			expect(sheet2.ownerNode).toBe(null);
			expect(sheet2.ownerRule).toBe(null);
			expect(sheet2.media.length).toBe(0);
			expect(sheet2.disabled).toBe(false);
			expect(sheet2.cssRules.length).toBe(0);

			sheet2.insertRule(redStyleTexts[1]);
			expect(sheet2.cssRules.length).toBe(1);
			expect(sheet2.cssRules[0]!.cssText).toBe(redStyleTexts[1]);

			sheet2.deleteRule(0);
			expect(sheet2.cssRules.length).toBe(0);

			const sheet3 = new CSSStyleSheet();
			expect(
				sheet3.title,
				'The title attribute must return the title or null if title is the empty string',
			).toBe(null);
			expect(sheet3.ownerNode).toBe(null);
			expect(sheet3.ownerRule).toBe(null);
			expect(sheet3.media.length).toBe(0);
			expect(sheet3.disabled).toBe(false);
			expect(sheet3.cssRules.length).toBe(0);

			sheet3.insertRule(redStyleTexts[1]);
			expect(sheet3.cssRules.length).toBe(1);
			expect(sheet3.cssRules[0]!.cssText).toBe(redStyleTexts[1]);

			sheet3.deleteRule(0);
			expect(sheet3.cssRules.length).toBe(0);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'title can be set in the CSSStyleSheet constructor',
		({ CSSStyleSheet }) => {
			const redStyleTexts = ['.red { color: red; }', '.red + span + span { color: red; }'] as const;

			const sheet = new CSSStyleSheet({ title: 'something' } as CSSStyleSheetInit);
			expect(
				sheet.title,
				'title and alternate are not supported by the constructor. https://github.com/WICG/construct-stylesheets/issues/105',
			).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'CSSStyleSheet.replace produces Promise<CSSStyleSheet>',
		async ({ CSSStyleSheet }) => {
			const redStyleTexts = ['.red { color: red; }', '.red + span + span { color: red; }'] as const;

			const sheet = new CSSStyleSheet({ disabled: true, media: 'screen, print' });
			const promise_sheet = sheet.replace(redStyleTexts[0]);
			return promise_sheet.then(function (sheet) {
				expect(
					sheet.title,
					'The title attribute must return the title or null if title is the empty string',
				).toBe(null);
				expect(sheet.ownerNode).toBe(null);
				expect(sheet.ownerRule).toBe(null);
				expect(sheet.media.length).toBe(2);
				expect(sheet.media.item(0)).toBe('screen');
				expect(sheet.media.item(1)).toBe('print');
				expect(sheet.disabled).toBe(true);
				expect(sheet.cssRules.length).toBe(1);
				expect(sheet.cssRules[0]!.cssText).toBe(redStyleTexts[0]);

				sheet.insertRule(redStyleTexts[1]);
				expect(sheet.cssRules.length).toBe(2);
				expect(sheet.cssRules[0]!.cssText).toBe(redStyleTexts[1]);
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
		'Constructed style sheets can be applied on document',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const { greenSpan, redSpan, blueSpan, whiteSpan, yellowSpan, createAllSheetsPromise } =
				prepare(document, CSSStyleSheet);

			return Promise.all(createAllSheetsPromise()).then((values) => {
				const greenStyleSheet = values[0]!;
				const redStyleSheet = values[1]!;
				const blueStyleSheet = values[2]!;
				const whiteStyleSheet = values[3]!;
				const yellowStyleSheet = values[4]!;

				// Lists of style sheets can be created, assigned and read.

				// disabled stylesheets aren't applied
				document.adoptedStyleSheets = [whiteStyleSheet];
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

				// disable dsheets don't block other styles from applying
				document.adoptedStyleSheets = [greenStyleSheet, blueStyleSheet];
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 128, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

				document.adoptedStyleSheets = [redStyleSheet, yellowStyleSheet];

				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(255, 255, 0)');

				document.adoptedStyleSheets = [
					redStyleSheet,
					yellowStyleSheet,
					greenStyleSheet,
					blueStyleSheet,
				];
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 128, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(255, 255, 0)');
				document.adoptedStyleSheets = [];
			});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Constructed style sheets can be applied on shadow root',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const {
				shadowRoot,
				greenShadowSpan,
				redShadowSpan,
				blueShadowSpan,
				whiteShadowSpan,
				yellowShadowSpan,
				createAllSheetsPromise,
			} = prepare(document, CSSStyleSheet);

			return Promise.all(createAllSheetsPromise()).then((values) => {
				const greenStyleSheet = values[0]!;
				const redStyleSheet = values[1]!;
				const blueStyleSheet = values[2]!;
				const whiteStyleSheet = values[3]!;
				const yellowStyleSheet = values[4]!;
				shadowRoot.adoptedStyleSheets = [whiteStyleSheet];
				expect(getComputedStyle(greenShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(blueShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowShadowSpan).color).toBe('rgb(0, 0, 0)');

				shadowRoot.adoptedStyleSheets = [greenStyleSheet, blueStyleSheet];
				expect(getComputedStyle(greenShadowSpan).color).toBe('rgb(0, 128, 0)');
				expect(getComputedStyle(redShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(blueShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowShadowSpan).color).toBe('rgb(0, 0, 0)');

				shadowRoot.adoptedStyleSheets = [redStyleSheet, yellowStyleSheet];
				expect(getComputedStyle(greenShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redShadowSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteShadowSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowShadowSpan).color).toBe('rgb(255, 255, 0)');

				shadowRoot.adoptedStyleSheets = [
					redStyleSheet,
					yellowStyleSheet,
					greenStyleSheet,
					blueStyleSheet,
				];
				expect(getComputedStyle(greenShadowSpan).color).toBe('rgb(0, 128, 0)');
				expect(getComputedStyle(redShadowSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteShadowSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowShadowSpan).color).toBe('rgb(255, 255, 0)');
			});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Re-attaching shadow host with adopted stylesheets work',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const { shadowHost, shadowRoot, greenShadowSpan, redShadowSpan, createAllSheetsPromise } =
				prepare(document, CSSStyleSheet);

			return Promise.all(createAllSheetsPromise()).then((values) => {
				const greenStyleSheet = values[0]!;
				const redStyleSheet = values[1]!;
				shadowRoot.adoptedStyleSheets = [greenStyleSheet];
				expect(getComputedStyle(greenShadowSpan).color, 'Style applies connected').toBe(
					'rgb(0, 128, 0)',
				);
				expect(getComputedStyle(redShadowSpan).color, 'Style applies when connected').toBe(
					'rgb(0, 0, 0)',
				);
				let hostParent = shadowHost.parentNode!;
				hostParent.removeChild(shadowHost);
				expect(getComputedStyle(greenShadowSpan).color, "Style doesn't apply when detached").toBe(
					'',
				);
				expect(getComputedStyle(redShadowSpan).color, "Style doesn't apply when detached").toBe('');
				shadowRoot.adoptedStyleSheets = [redStyleSheet, greenStyleSheet];
				hostParent.appendChild(shadowHost);
				expect(getComputedStyle(greenShadowSpan).color, 'Style applies after reattach').toBe(
					'rgb(0, 128, 0)',
				);
				expect(getComputedStyle(redShadowSpan).color, 'Style applies after reattach').toBe(
					'rgb(255, 0, 0)',
				);
			});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Attaching a shadow root that already has adopted stylesheets work',
		({ document, CSSStyleSheet, getComputedStyle }) => {
			const {} = prepare(document, CSSStyleSheet);

			const sheet = new CSSStyleSheet();
			sheet.replaceSync(':host { color: red; }');
			const host = document.createElement('div');
			let sr = host.attachShadow({ mode: 'open' });
			sr.adoptedStyleSheets = [sheet];
			document.body.appendChild(host);
			expect(getComputedStyle(host).color, 'Style applies when connected').toBe('rgb(255, 0, 0)');
			sheet.replaceSync(':host { color: blue; }');
			expect(getComputedStyle(host).color, 'Style update applies when connected').toBe(
				'rgb(0, 0, 255)',
			);
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Re-attaching shadow host and updating attributes work',
		({ document, CSSStyleSheet, getComputedStyle }) => {
			const {} = prepare(document, CSSStyleSheet);

			const sheet = new CSSStyleSheet();
			sheet.replaceSync(':host([red]) { color: red; } :host(.blue) { color: blue; }');
			const host = document.createElement('div');
			host.toggleAttribute('red');
			document.body.appendChild(host);
			expect(getComputedStyle(host).color, 'No style applies yet').toBe('rgb(0, 0, 0)');

			let sr = host.attachShadow({ mode: 'open' });
			sr.adoptedStyleSheets = [sheet];

			expect(getComputedStyle(host).color, 'Style applies after adding style').toBe(
				'rgb(255, 0, 0)',
			);
			document.body.removeChild(host);
			document.body.appendChild(host);
			expect(getComputedStyle(host).color, 'Style applies after reattachment').toBe(
				'rgb(255, 0, 0)',
			);
			host.toggleAttribute('red');
			expect(
				getComputedStyle(host).color,
				'Attribute updates to the element after reattachment apply',
			).toBe('rgb(0, 0, 0)');
			host.classList.toggle('blue');
			expect(
				getComputedStyle(host).color,
				'Class updates to the element after reattachment apply',
			).toBe('rgb(0, 0, 255)');
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Changes to constructed stylesheets through CSSOM is reflected',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const { redStyleTexts, greenSpan, redSpan, blueSpan, whiteSpan, yellowSpan } = prepare(
				document,
				CSSStyleSheet,
			);

			const plainSheet = new CSSStyleSheet();
			const redStyleSheetPromise = plainSheet.replace(redStyleTexts[0]!);
			return redStyleSheetPromise.then(function (redStyleSheet) {
				document.adoptedStyleSheets = [redStyleSheet];
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

				redStyleSheet.insertRule(redStyleTexts[1]!);
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

				redStyleSheet.deleteRule(1);
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

				(redStyleSheet.cssRules[0]! as CSSStyleRule).style.color = 'white';
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(255, 255, 255)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');
			});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Constructed stylesheet can be used and modified in multiple TreeScopes',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const {
				redStyleTexts,
				shadowRoot,
				greenSpan,
				redSpan,
				blueSpan,
				whiteSpan,
				yellowSpan,
				greenShadowSpan,
				redShadowSpan,
				blueShadowSpan,
				whiteShadowSpan,
				yellowShadowSpan,
			} = prepare(document, CSSStyleSheet);

			const plainSheet = new CSSStyleSheet();
			const redStyleSheetPromise = plainSheet.replace(redStyleTexts[0]!);
			return redStyleSheetPromise.then(function (redStyleSheet) {
				document.adoptedStyleSheets = [redStyleSheet];
				shadowRoot.adoptedStyleSheets = [redStyleSheet];
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

				expect(getComputedStyle(greenShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redShadowSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowShadowSpan).color).toBe('rgb(0, 0, 0)');

				shadowRoot.adoptedStyleSheets[0]!.insertRule(redStyleTexts[1]!);
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

				expect(getComputedStyle(greenShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redShadowSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueShadowSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteShadowSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowShadowSpan).color).toBe('rgb(0, 0, 0)');
				document.adoptedStyleSheets = [];
			});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Stylesheets constructed on the main Document cannot be used in iframes',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const { redStyleTexts, firstDiv, greenSpan, redSpan, blueSpan, whiteSpan, yellowSpan } =
				prepare(document, CSSStyleSheet);

			const iframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			const thirdDiv = firstDiv.cloneNode(true) as HTMLElement;
			iframe.contentDocument!.body.appendChild(thirdDiv);
			const greenIframeSpan = thirdDiv.children[0]!;
			const redIframeSpan = thirdDiv.children[1]!;
			const blueIframeSpan = thirdDiv.children[2]!;
			const whiteIframeSpan = thirdDiv.children[3]!;
			const yellowIframeSpan = thirdDiv.children[4]!;

			const plainSheet = new CSSStyleSheet();
			const redStyleSheetPromise = plainSheet.replace(redStyleTexts[0]!);
			return redStyleSheetPromise.then(function (redStyleSheet) {
				expect(() => {
					iframe.contentDocument!.adoptedStyleSheets = [redStyleSheet];
				}).toThrow(
					expect.objectContaining({
						name: 'NotAllowedError',
						code: 0,
						constructor: (iframe.contentWindow as Window & typeof globalThis).DOMException,
					}),
				);
				expect(getComputedStyle(greenIframeSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redIframeSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(blueIframeSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteIframeSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowIframeSpan).color).toBe('rgb(0, 0, 0)');

				document.adoptedStyleSheets = [redStyleSheet];
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

				document.adoptedStyleSheets[0]!.insertRule(redStyleTexts[1]!);
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');
			});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Stylesheet constructed on iframe cannot be used in the main Document',
		async ({ document, CSSStyleSheet, getComputedStyle, DOMException }) => {
			const { redStyleTexts, firstDiv, greenSpan, redSpan, blueSpan, whiteSpan, yellowSpan } =
				prepare(document, CSSStyleSheet);

			const iframe = document.createElement('iframe');
			const iframeLoaded = new Promise((resolve) => iframe.addEventListener('load', resolve));
			document.body.appendChild(iframe);
			await iframeLoaded;
			const thirdDiv = firstDiv.cloneNode(true) as HTMLElement;
			iframe.contentDocument!.body.appendChild(thirdDiv);
			const greenIframeSpan = thirdDiv.children[0]!;
			const redIframeSpan = thirdDiv.children[1]!;
			const blueIframeSpan = thirdDiv.children[2]!;
			const whiteIframeSpan = thirdDiv.children[3]!;
			const yellowIframeSpan = thirdDiv.children[4]!;

			// Make sure both the main Document and the iframe are not styled
			const emptyStyleSheet = new CSSStyleSheet();
			document.adoptedStyleSheets = [emptyStyleSheet];
			expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(redSpan).color).toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(whiteSpan).color).toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

			expect(getComputedStyle(greenIframeSpan).color).toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(redIframeSpan).color).toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(blueIframeSpan).color).toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(whiteIframeSpan).color).toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(yellowIframeSpan).color).toBe('rgb(0, 0, 0)');

			const iframePlainSheet = new (
				iframe.contentWindow as Window & typeof globalThis
			).CSSStyleSheet();
			const iframeRedStyleSheetPromise = iframePlainSheet.replace(redStyleTexts[0]!);
			return iframeRedStyleSheetPromise.then(function (iframeRedStyleSheet) {
				expect(() => {
					document.adoptedStyleSheets = [iframeRedStyleSheet];
				}).toThrow(
					expect.objectContaining({ name: 'NotAllowedError', code: 0, constructor: DOMException }),
				);
				expect(getComputedStyle(greenSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(blueSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowSpan).color).toBe('rgb(0, 0, 0)');

				iframe.contentDocument!.adoptedStyleSheets = [iframeRedStyleSheet];
				expect(getComputedStyle(greenIframeSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redIframeSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueIframeSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteIframeSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(yellowIframeSpan).color).toBe('rgb(0, 0, 0)');

				iframe.contentDocument!.adoptedStyleSheets[0]!.insertRule(redStyleTexts[1]!);
				expect(getComputedStyle(greenIframeSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(redIframeSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(blueIframeSpan).color).toBe('rgb(0, 0, 0)');
				expect(getComputedStyle(whiteIframeSpan).color).toBe('rgb(255, 0, 0)');
				expect(getComputedStyle(yellowIframeSpan).color).toBe('rgb(0, 0, 0)');
			});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Adding non-constructed stylesheet to AdoptedStyleSheets is not allowed when the owner document of the stylesheet is in the same document tree as the AdoptedStyleSheets',
		({ document, CSSStyleSheet, getComputedStyle, DOMException }) => {
			const { divNonConstructed, nonConstructedStyleSheet } = prepare(document, CSSStyleSheet);

			expect(getComputedStyle(divNonConstructed).color).toBe('rgb(0, 0, 0)');
			expect(() => {
				document.adoptedStyleSheets = [nonConstructedStyleSheet];
			}).toThrow(
				expect.objectContaining({ name: 'NotAllowedError', code: 0, constructor: DOMException }),
			);
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Adding non-constructed stylesheet to AdoptedStyleSheets is not allowed when the owner document of the stylesheet and the AdoptedStyleSheets are in different document trees',
		({ document, CSSStyleSheet, getComputedStyle, DOMException }) => {
			const { divNonConstructed, nonConstructedStyleSheet } = prepare(document, CSSStyleSheet);

			const iframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			const iframeDiv = iframe.contentDocument!.createElement('div');
			iframeDiv.classList.add('nonConstructed');
			iframe.contentDocument!.body.appendChild(iframeDiv);

			expect(getComputedStyle(iframeDiv).color).toBe('rgb(0, 0, 0)');
			expect(() => {
				iframe.contentDocument!.adoptedStyleSheets = [nonConstructedStyleSheet];
			}).toThrow(
				expect.objectContaining({
					name: 'NotAllowedError',
					code: 0,
					constructor: (iframe.contentWindow as Window & typeof globalThis).DOMException,
				}),
			);
			expect(getComputedStyle(iframeDiv).color).toBe('rgb(0, 0, 0)');

			const iframeStyle = iframe.contentDocument!.createElement('style');
			iframe.contentDocument!.body.appendChild(iframeStyle);
			iframeStyle.sheet!.insertRule('.nonConstructedSpan { color: red; }');
			const iframeStyleSheet = iframeStyle.sheet!;
			const nonConstructedSpan = document.createElement('span');
			nonConstructedSpan.classList.add('.nonConstructedSpan');
			divNonConstructed.appendChild(nonConstructedSpan);

			expect(getComputedStyle(iframeDiv).color).toBe('rgb(0, 0, 0)');
			expect(() => {
				document.adoptedStyleSheets = [iframeStyleSheet];
			}).toThrow(
				expect.objectContaining({ name: 'NotAllowedError', code: 0, constructor: DOMException }),
			);
			expect(getComputedStyle(iframeDiv).color).toBe('rgb(0, 0, 0)');
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'CSSStyleSheet.replaceSync replaces stylesheet text synchronously',
		({ document, CSSStyleSheet }) => {
			const { redStyleTexts } = prepare(document, CSSStyleSheet);

			const sheet = new CSSStyleSheet();
			expect(sheet.cssRules.length).toBe(0);

			sheet.replaceSync(redStyleTexts[0]!);
			expect(sheet.cssRules.length).toBe(1);
			expect(redStyleTexts[0]!).toBe(sheet.cssRules[0]!.cssText);

			sheet.replaceSync(redStyleTexts[1]!);
			expect(sheet.cssRules.length).toBe(1);
			expect(redStyleTexts[1]!).toBe(sheet.cssRules[0]!.cssText);
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'CSSStyleSheet.replaceSync correctly updates the style of its adopters synchronously',
		({ document, CSSStyleSheet, getComputedStyle }) => {
			const { redStyleTexts, shadowRoot, thirdSection, attachShadowDiv } = prepare(
				document,
				CSSStyleSheet,
			);

			// Attach a div inside a shadow root with the class ".red".
			const span = document.createElement('span');
			thirdSection.appendChild(span);
			const shadowDiv = attachShadowDiv(span);
			shadowDiv.classList.add('red');
			// Create empty stylesheet.
			const sheet = new CSSStyleSheet();
			span.shadowRoot!.adoptedStyleSheets = [sheet];
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');
			// Replace the stylesheet text that will color it red.
			sheet.replaceSync(redStyleTexts[0]!);
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(255, 0, 0)');
			expect(sheet.cssRules.length).toBe(1);
			expect(sheet.cssRules[0]!.cssText).toBe(redStyleTexts[0]!);
			sheet.insertRule(redStyleTexts[1]!);
			expect(sheet.cssRules.length).toBe(2);
			expect(sheet.cssRules[0]!.cssText).toBe(redStyleTexts[1]!);
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Adopted sheets are ordered after non-adopted sheets in the shadow root',
		({ document, CSSStyleSheet, getComputedStyle }) => {
			const { shadowRoot, thirdSection, attachShadowDiv } = prepare(document, CSSStyleSheet);

			// Attach a div inside a shadow root with the class ".red".
			const span = document.createElement('span');
			thirdSection.appendChild(span);
			const shadowDiv = attachShadowDiv(span);
			shadowDiv.classList.add('target');

			// Create empty stylesheet.
			const sheet = new CSSStyleSheet();
			span.shadowRoot!.adoptedStyleSheets = [sheet];
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');

			// Replace the stylesheet text that will color it red.
			sheet.replaceSync('.target { color: red; }');
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(255, 0, 0)');

			// Create a style element that will set colors to white.
			const style = document.createElement('style');
			style.textContent = '.target { color: white; }';
			span.shadowRoot!.appendChild(style);
			expect(
				getComputedStyle(shadowDiv).color,
				'non-adopted styles should be ordered before adopted styles',
			).toBe('rgb(255, 0, 0)');

			span.shadowRoot!.adoptedStyleSheets = [];
			expect(
				getComputedStyle(shadowDiv).color,
				'with no adopted styles in conflict, the non-adopted style should take effect',
			).toBe('rgb(255, 255, 255)');

			span.shadowRoot!.adoptedStyleSheets = [sheet];
			expect(
				getComputedStyle(shadowDiv).color,
				'the adopted style should be ordered after the non-adopted style',
			).toBe('rgb(255, 0, 0)');

			sheet.disabled = true;
			expect(
				getComputedStyle(shadowDiv).color,
				'with the adopted sheet disabled, the non-adopted style should take effect',
			).toBe('rgb(255, 255, 255)');

			sheet.disabled = false;
			expect(
				getComputedStyle(shadowDiv).color,
				'the adopted sheet re-enabled, it should take effect again',
			).toBe('rgb(255, 0, 0)');
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Adopted sheets are ordered after non-adopted sheets in the document',
		({ document, CSSStyleSheet, getComputedStyle }) => {
			const { thirdSection } = prepare(document, CSSStyleSheet);

			// Attach a div inside a shadow root with the class ".red".
			const span = document.createElement('span');
			thirdSection.appendChild(span);
			span.classList.add('target');

			// Create empty stylesheet.
			const sheet = new CSSStyleSheet();
			document.adoptedStyleSheets = [sheet];
			expect(getComputedStyle(span).color).toBe('rgb(0, 0, 0)');

			// Replace the stylesheet text that will color it red.
			sheet.replaceSync('.target { color: red; }');
			expect(getComputedStyle(span).color).toBe('rgb(255, 0, 0)');

			// Create a style element that will set colors to white.
			const style = document.createElement('style');
			style.textContent = '.target { color: white; }';
			span.appendChild(style);
			expect(
				getComputedStyle(span).color,
				'non-adopted styles should be ordered before adopted styles',
			).toBe('rgb(255, 0, 0)');

			document.adoptedStyleSheets = [];
			expect(
				getComputedStyle(span).color,
				'with no adopted styles in conflict, the non-adopted style should take effect',
			).toBe('rgb(255, 255, 255)');

			document.adoptedStyleSheets = [sheet];
			expect(
				getComputedStyle(span).color,
				'the adopted style should be ordered after the non-adopted style',
			).toBe('rgb(255, 0, 0)');

			sheet.disabled = true;
			expect(
				getComputedStyle(span).color,
				'with the adopted sheet disabled, the non-adopted style should take effect',
			).toBe('rgb(255, 255, 255)');

			sheet.disabled = false;
			expect(
				getComputedStyle(span).color,
				'the adopted sheet re-enabled, it should take effect again',
			).toBe('rgb(255, 0, 0)');
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Inserting an @import rule through insertRule on a constructed stylesheet throws an exception',
		({ document, CSSStyleSheet, DOMException }) => {
			const { import_text } = prepare(document, CSSStyleSheet);

			expect(() => {
				new CSSStyleSheet().insertRule(import_text);
			}).toThrow(
				expect.objectContaining({ name: 'SyntaxError', code: 12, constructor: DOMException }),
			);
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'CSSStyleSheet.replace allows, but ignores, import rule inside',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const { shadowRoot, thirdSection, attachShadowDiv, import_text } = prepare(
				document,
				CSSStyleSheet,
			);

			const span = document.createElement('span');
			thirdSection.appendChild(span);
			const shadowDiv = attachShadowDiv(span);
			const sheet = new CSSStyleSheet();
			span.shadowRoot!.adoptedStyleSheets = [sheet];
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');
			// Replace and assert that the imported rule is NOT applied.
			const sheet_promise = sheet.replace(import_text);
			return sheet_promise
				.then((sheet) => {
					// replace() ignores @import rules:
					expect(sheet.cssRules.length).toBe(0);
					expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');
				})
				.catch((reason) => {
					expect.unreachable(`Promise was rejected (${reason}) when it should have been resolved`);
				});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'CSSStyleSheet.replace ignores @import rule but still loads other rules',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const { shadowRoot, thirdSection, attachShadowDiv, import_text } = prepare(
				document,
				CSSStyleSheet,
			);

			const span = document.createElement('span');
			thirdSection.appendChild(span);
			const shadowDiv = attachShadowDiv(span);
			const targetSpan = document.createElement('span');
			targetSpan.classList.add('target');
			shadowDiv.appendChild(targetSpan);
			const sheet = new CSSStyleSheet();
			span.shadowRoot!.adoptedStyleSheets = [sheet];
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');
			// Replace and assert that the imported rule is NOT applied, but regular rule does apply.
			const sheet_promise = sheet.replace(import_text + '.target { color: blue; }');
			return sheet_promise
				.then((sheet) => {
					expect(sheet.cssRules.length).toBe(1);
					// @import not applied:
					expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');
					// regular rule applied:
					expect(getComputedStyle(targetSpan).color).toBe('rgb(0, 0, 255)');
				})
				.catch((reason) => {
					expect.unreachable(`Promise was rejected (${reason}) when it should have been resolved`);
				});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'CSSStyleSheet.replaceSync allows, but ignores, import rule inside',
		({ document, CSSStyleSheet, getComputedStyle }) => {
			const { shadowRoot, thirdSection, attachShadowDiv, import_text } = prepare(
				document,
				CSSStyleSheet,
			);

			const span = document.createElement('span');
			thirdSection.appendChild(span);
			const shadowDiv = attachShadowDiv(span);
			const sheet = new CSSStyleSheet();
			span.shadowRoot!.adoptedStyleSheets = [sheet];
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');
			// Replace and assert that the imported rule is NOT applied.
			try {
				sheet.replaceSync(import_text);
				// replaceSync() ignores @import rules:
				expect(sheet.cssRules.length).toBe(0);
				expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');
			} catch (reason) {
				expect.unreachable(`replaceSync threw an exception (${reason}) when it shouldn't have`);
			}
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'CSSStyleSheet.replace does not reject on failed imports',
		async ({ document, CSSStyleSheet }) => {
			const {} = prepare(document, CSSStyleSheet);

			const sheet = new CSSStyleSheet();
			const sheet_promise = sheet.replace("@import url('not-there.css');");

			return sheet_promise
				.then((sheet) => {
					// No exception here
				})
				.catch((reason) => {
					expect.unreachable('Promise was rejected');
				});
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Cloning a shadow host will not clone shadow root, and also adoptedStyleSheets',
		({ document, CSSStyleSheet }) => {
			const { shadowRoot, thirdSection, attachShadowDiv } = prepare(document, CSSStyleSheet);

			const span = document.createElement('span');
			thirdSection.appendChild(span);
			const shadowDiv = attachShadowDiv(span);
			const sheet = new CSSStyleSheet();
			span.shadowRoot!.adoptedStyleSheets = [sheet];

			const newSpan = span.cloneNode(true) as HTMLElement;
			expect(newSpan.shadowRoot).toBe(null);
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Importing a shadow host will not copy shadow root, and also adoptedStyleSheets',
		({ document, CSSStyleSheet }) => {
			const { shadowRoot, thirdSection, attachShadowDiv } = prepare(document, CSSStyleSheet);

			const span = document.createElement('span');
			thirdSection.appendChild(span);
			const shadowDiv = attachShadowDiv(span);
			const sheet = new CSSStyleSheet();
			span.shadowRoot!.adoptedStyleSheets = [sheet];

			const iframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			const newSpan = iframe.contentDocument!.importNode(span, true);
			iframe.contentDocument!.body.appendChild(newSpan);
			expect(newSpan.shadowRoot).toBe(null);
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Adopting a shadow host will empty adoptedStyleSheets if adopting to a different document',
		({ document, CSSStyleSheet, getComputedStyle }) => {
			const { shadowRoot, thirdSection, attachShadowDiv } = prepare(document, CSSStyleSheet);

			const span = document.createElement('span');
			thirdSection.appendChild(span);
			const shadowDiv = attachShadowDiv(span);
			const sheet = new CSSStyleSheet();
			sheet.replaceSync('* { color: red; }');
			span.shadowRoot!.adoptedStyleSheets = [sheet];
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(255, 0, 0)');

			document.adoptNode(span);
			expect(span.shadowRoot!.adoptedStyleSheets.length).toBe(1);
			expect(span.shadowRoot!.adoptedStyleSheets[0]!).toBe(sheet);

			const iframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			iframe.contentDocument!.adoptNode(span);
			iframe.contentDocument!.body.appendChild(span);
			expect(span.shadowRoot).not.toBe(null);
			expect(span.shadowRoot!.adoptedStyleSheets.length).toBe(0);
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		`Adopting a shadow host's ancestor will empty adoptedStyleSheets if adopting to a different document`,
		({ document, CSSStyleSheet, getComputedStyle }) => {
			const { shadowRoot, thirdSection, attachShadowDiv } = prepare(document, CSSStyleSheet);

			const span = document.createElement('span');
			const div = document.createElement('div');
			thirdSection.appendChild(span);
			span.appendChild(div);
			const shadowDiv = attachShadowDiv(div);
			const sheet = new CSSStyleSheet();
			sheet.replaceSync('* { color: red; }');
			div.shadowRoot!.adoptedStyleSheets = [sheet];
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(255, 0, 0)');

			document.adoptNode(span);
			expect(div.shadowRoot!.adoptedStyleSheets.length).toBe(1);
			expect(div.shadowRoot!.adoptedStyleSheets[0]!).toBe(sheet);

			const iframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			iframe.contentDocument!.adoptNode(span);
			iframe.contentDocument!.body.appendChild(span);
			expect(div.shadowRoot).not.toBe(null);
			expect(div.shadowRoot!.adoptedStyleSheets.length).toBe(0);
			expect(getComputedStyle(shadowDiv).color).toBe('rgb(0, 0, 0)');
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Forcing a style update after adding an adopted stylesheet on a disconnected shadow root should not crash.',
		({ document, CSSStyleSheet }) => {
			const {} = prepare(document, CSSStyleSheet);

			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'open' });
			root.adoptedStyleSheets = [new CSSStyleSheet()];
			document.body.offsetTop;
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'Modifying an adopted stylesheet on a disconnected shadow root should not crash.',
		({ document, CSSStyleSheet }) => {
			const { thirdSection } = prepare(document, CSSStyleSheet);

			const host = document.createElement('div');
			thirdSection.appendChild(host);
			const root = host.attachShadow({ mode: 'open' });
			const sheet = new CSSStyleSheet();
			root.adoptedStyleSheets = [sheet];
			host.remove();
			sheet.replaceSync('');
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
}
