import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [declarations, expected_invalid, expected_valid, description] of [
		[['--a:var(--a)'], ['--a'], [], 'Self-cycle'],
		[['--a:var(--b)', '--b:var(--a)'], ['--a', '--b'], [], 'Simple a/b cycle'],
		[
			['--a:var(--b, cycle)', '--b:var(--c, cycle)', '--c:var(--a, cycle)'],
			['--a', '--b', '--c'],
			[],
			'Three-var cycle',
		],
		[
			[
				'--x:var(--y, valid)',
				'--y:var(--a, valid)',
				'--a:var(--b, cycle)',
				'--b:var(--c, cycle)',
				'--c:var(--a, cycle)',
			],
			['--a', '--b', '--c'],
			['--x', '--y'],
			'Cycle that starts in the middle of a chain',
		],
		[
			[
				'--x:var(--a, valid)',
				'--a:var(--b, cycle)',
				'--b:var(--c, cycle)',
				'--c:var(--a, cycle) var(--y)',
				'--y:valid',
			],
			['--a', '--b', '--c'],
			['--x', '--y'],
			'Cycle with extra edge',
		],
		[
			[
				'--x:var(--a, valid)',
				'--a:var(--b, cycle)',
				'--b:var(--c, cycle) var(--y)',
				'--c:var(--a, cycle)',
				'--y:valid',
			],
			['--a', '--b', '--c'],
			['--x', '--y'],
			'Cycle with extra edge (2)',
		],
		[
			[
				'--x:var(--a, valid)',
				'--a:var(--b, cycle)',
				'--b:var(--c, cycle)',
				'--c:var(--a, cycle) var(--y)',
				'--y:var(--z)',
				'--z:valid',
			],
			['--a', '--b', '--c'],
			['--x', '--y', '--z'],
			'Cycle with extra edge (3)',
		],
		[
			[
				'--x:var(--a, valid)',
				'--a:var(--b, cycle)',
				'--b:var(--c, cycle) var(--a, cycle)',
				'--c:var(--d, cycle)',
				'--d:var(--b, cycle)',
			],
			['--a', '--b', '--c', '--d'],
			['--x'],
			'Cycle with secondary cycle',
		],
		[
			[
				'--x:var(--a, valid)',
				'--a:var(--b, cycle)',
				'--b:var(--c, cycle)',
				'--c:var(--d, cycle) var(--a, cycle)',
				'--d:var(--b, cycle) var(--y)',
				'--y:valid',
			],
			['--a', '--b', '--c', '--d'],
			['--x', '--y'],
			'Cycle with overlapping secondary cycle',
		],
		[
			[
				'--x:var(--a, valid)',
				'--a:var(--b, cycle) var(--y, valid) var(--c, cycle)',
				'--b:var(--a, cycle) ',
				'--c:var(--d, cycle)',
				'--d:var(--a, cycle)',
				'--y:valid',
			],
			['--a', '--b', '--c', '--d'],
			['--x', '--y'],
			'Cycle with deeper secondary cycle',
		],
		[
			[
				'--x:var(--a, valid)',
				'--a:var(--y, var(--b, cycle))',
				'--b:var(--y, var(--c, cycle))',
				'--c:var(--y, var(--a, cycle))',
				'--y:valid',
			],
			[],
			['--a', '--b', '--c', '--x', '--y'],
			'Cycle in unused fallback',
		],
	] as [string[], string[], string[], string][]) {
		context.test(
			description,
			({ document, getComputedStyle }) => {
				const main = document.getElementById('main')!;

				let element = document.createElement('div');

				try {
					declarations.push('--sanity:valid');
					(element as unknown as { style: string }).style = declarations.join(';');
					main.append(element);
					let cs = getComputedStyle(element);

					for (let e of expected_invalid) expect(cs.getPropertyValue(e), `${e}`).toBe('');
					for (let e of expected_valid) expect(cs.getPropertyValue(e), `${e}`).not.toBe('');

					expect(cs.getPropertyValue('--sanity'), '--sanity').toBe('valid');
				} finally {
					element.remove();
				}
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf8">\n<title>Test that custom property cycles behave correctly</title>\n\n\n\n<main id=main></main>\n\n',
				},
			},
		);
	}
}
