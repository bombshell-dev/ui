import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Should throw if none of childList, attributes, characterData are true',
		({ document, MutationObserver, TypeError }) => {
			let m = new MutationObserver(() => {});
			expect(() => {
				m.observe(document, {});
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if childList is true',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { childList: true });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if attributes is true',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { attributes: true });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if characterData is true',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { characterData: true });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if attributeOldValue is true and attributes is omitted',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { attributeOldValue: true });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if characterDataOldValue is true and characterData is omitted',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { characterDataOldValue: true });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if attributeFilter is present and attributes is omitted',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { attributes: ['abc'] as unknown as boolean });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should throw if attributeOldValue is true and attributes is false',
		({ document, MutationObserver, TypeError }) => {
			let m = new MutationObserver(() => {});
			expect(() => {
				m.observe(document, { childList: true, attributeOldValue: true, attributes: false });
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if attributeOldValue and attributes are both true',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { childList: true, attributeOldValue: true, attributes: true });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should throw if attributeFilter is present and attributes is false',
		({ document, MutationObserver, TypeError }) => {
			let m = new MutationObserver(() => {});
			expect(() => {
				m.observe(document, { childList: true, attributeFilter: ['abc'], attributes: false });
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if attributeFilter is present and attributes is true',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { childList: true, attributeFilter: ['abc'], attributes: true });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should throw if characterDataOldValue is true and characterData is false',
		({ document, MutationObserver, TypeError }) => {
			let m = new MutationObserver(() => {});
			expect(() => {
				m.observe(document, { childList: true, characterDataOldValue: true, characterData: false });
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if characterDataOldValue is true and characterData is true',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { childList: true, characterDataOldValue: true, characterData: true });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if attributeOldValue is false and attributes is omitted',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { attributeOldValue: false });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Should not throw if characterDataOldValue is false and characterData is omitted',
		({ document, MutationObserver }) => {
			let m = new MutationObserver(() => {});
			m.observe(document, { characterDataOldValue: false });
			m.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
	context.test(
		'attributeOldValue:false (present) auto-enables attribute observation',
		async ({ document, MutationObserver, step }) => {
			await new Promise<void>((resolve) => {
				let target = document.createElement('div');
				let m = new MutationObserver((records) => {
					step(() => {
						expect(records.length).toBe(1);
						expect(records[0]!.type).toBe('attributes');
						expect(records[0]!.attributeName).toBe('data-x');
						expect(records[0]!.oldValue).toBe(null);
						m.disconnect();
					})();
					resolve();
				});
				m.observe(target, { attributeOldValue: false });
				target.setAttribute('data-x', '1');
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html>\n<meta charset=utf-8>\n<title></title>\n\n\n\n',
			},
		},
	);
}
