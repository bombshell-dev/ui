import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#concept-cd-replace';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('edits UTF-16 units and rejects out-of-range offsets', ({ document }) => {
		const text = document.createTextNode('A😀B');
		expect(text.substringData(1, 2)).toBe('😀');
		text.replaceData(1, 2, 'X');
		expect(text.data).toBe('AXB');
		text.insertData(1, 'Y');
		text.appendData('!');
		expect(text.data).toBe('AYXB!');
		text.deleteData(1, 2);
		expect(text.data).toBe('AB!');
		expect(() => text.insertData(9, 'bad')).toThrow(
			expect.objectContaining({ name: 'IndexSizeError' }),
		);
		expect(text.data).toBe('AB!');
	});

	context.test('counts UTF-16 code units and clamps oversized counts', (fixture) => {
		const document = fixture.document as unknown as Document;
		const t = document.createTextNode('A😀B');
		expect(t.length).toBe(4);
		expect(t.substringData(1, 2)).toBe('😀');
		expect(t.substringData(4, 100)).toBe('');
		t.replaceData(1, 100, 'x');
		expect(t.data).toBe('Ax');
		t.insertData(t.length, '!');
		expect(t.data).toBe('Ax!');
	});

	context.test('rejects invalid offsets without partial changes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const t = document.createTextNode('abc');
		for (const op of [
			() => t.substringData(4, 1),
			() => t.insertData(4, 'x'),
			() => t.deleteData(4, 1),
			() => t.replaceData(4, 1, 'x'),
		]) {
			expect(op).toThrow(expect.objectContaining({ name: 'IndexSizeError' }));
			expect(t.data).toBe('abc');
		}
	});
}
