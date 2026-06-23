import { describe, expect, test } from 'vitest';
import { box, boxPropsToOps, text, textPropsToOps, toOps } from '../index.ts';

// `@bomb.sh/tty` op directives (OP_OPEN_ELEMENT / OP_TEXT / OP_CLOSE_ELEMENT).
const OPEN = 2;
const TEXT = 3;
const CLOSE = 4;

describe('toOps', () => {
	test('emits open/text/close for a box of text, framework-free', () => {
		const ops = toOps([
			box(
				{ layout: { direction: 'ttb', gap: 1 } },
				text({ color: 15 }, 'Hello'),
				text({ color: 9 }, 'world'),
			),
		]);

		expect(ops.map((op) => op.directive)).toEqual([OPEN, TEXT, TEXT, CLOSE]);
		expect(ops[0]).toMatchObject({ layout: { direction: 'ttb', gap: 1 } });
		expect(ops[1]).toMatchObject({ directive: TEXT, content: 'Hello', color: 15 });
		expect(ops[2]).toMatchObject({ directive: TEXT, content: 'world', color: 9 });
	});

	test('assigns positional ids, but honors a binding-supplied id', () => {
		expect(toOps([box({}), box({})])[0]).toMatchObject({ id: 'b0' });
		expect(toOps([box({}), box({})])[2]).toMatchObject({ id: 'b1' });

		const node = box({});
		node.id = 'stable-42';
		expect(toOps([node])[0]).toMatchObject({ id: 'stable-42' });
	});
});

describe('prop mapping (1:1 passthrough for now)', () => {
	test('boxPropsToOps returns the open-op props unchanged', () => {
		const props = { layout: { gap: 2 }, border: { color: 7 }, bg: 1 };
		expect(boxPropsToOps(props)).toEqual(props);
	});

	test('textPropsToOps returns the text-op props unchanged', () => {
		expect(textPropsToOps({ color: 3, wrap: 1 })).toEqual({ color: 3, wrap: 1 });
	});
});
