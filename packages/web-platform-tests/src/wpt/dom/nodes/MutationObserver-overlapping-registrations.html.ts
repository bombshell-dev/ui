import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Observers registered on separate targets do not share registrations',
		({ document, MutationObserver }) => {
			const firstTarget = document.createElement('div');
			const secondTarget = document.createElement('div');
			const firstObserver = new MutationObserver(() => {});
			const secondObserver = new MutationObserver(() => {});

			firstObserver.observe(firstTarget, { attributes: true });
			secondObserver.observe(secondTarget, { attributes: true });

			firstTarget.setAttribute('data-value', 'after');
			expect(firstObserver.takeRecords().length, 'the first observer receives the mutation').toBe(
				1,
			);
			expect(
				secondObserver.takeRecords().length,
				'the second observer does not receive the mutation',
			).toBe(0);

			firstObserver.disconnect();
			secondObserver.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<meta charset=utf-8>\n<title>MutationObserver overlapping registrations</title>\n\n\n\n',
			},
		},
	);
	context.test(
		'An observer matching through multiple registrations receives one record with the requested old value',
		({ document, MutationObserver }) => {
			for (const [targetRequestsOldValue, ancestorRequestsOldValue] of [
				[false, true],
				[true, false],
			] as const) {
				const ancestor = document.createElement('div');
				const target = ancestor.appendChild(document.createElement('div'));
				target.setAttribute('data-value', 'before');

				const observer = new MutationObserver(() => {});
				observer.observe(target, { attributes: true, attributeOldValue: targetRequestsOldValue });
				observer.observe(ancestor, {
					attributes: true,
					attributeOldValue: ancestorRequestsOldValue,
					subtree: true,
				});

				target.setAttribute('data-value', 'after');
				const records = observer.takeRecords();
				expect(records.length, 'the observer receives one record').toBe(1);
				expect(records[0]!.oldValue, 'the record includes the requested old value').toBe('before');
				observer.disconnect();
			}
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<meta charset=utf-8>\n<title>MutationObserver overlapping registrations</title>\n\n\n\n',
			},
		},
	);
	context.test(
		'Distinct observers matching the same mutation receive records using their own options',
		({ document, MutationObserver }) => {
			const ancestor = document.createElement('div');
			const target = ancestor.appendChild(document.createElement('div'));
			target.setAttribute('data-value', 'before');

			const overlappingObserver = new MutationObserver(() => {});
			overlappingObserver.observe(target, { attributes: true });

			const ancestorObserver = new MutationObserver(() => {});
			ancestorObserver.observe(ancestor, { attributes: true, subtree: true });

			overlappingObserver.observe(ancestor, {
				attributes: true,
				attributeOldValue: true,
				subtree: true,
			});

			target.setAttribute('data-value', 'after');
			const overlappingRecords = overlappingObserver.takeRecords();
			const ancestorRecords = ancestorObserver.takeRecords();

			expect(overlappingRecords.length, 'the overlapping observer receives one record').toBe(1);
			expect(
				overlappingRecords[0]!.oldValue,
				'the overlapping observer receives the old value',
			).toBe('before');
			expect(ancestorRecords.length, 'the ancestor observer receives one record').toBe(1);
			expect(
				ancestorRecords[0]!.oldValue,
				'the ancestor observer does not receive the old value',
			).toBe(null);

			overlappingObserver.disconnect();
			ancestorObserver.disconnect();
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<meta charset=utf-8>\n<title>MutationObserver overlapping registrations</title>\n\n\n\n',
			},
		},
	);
}
