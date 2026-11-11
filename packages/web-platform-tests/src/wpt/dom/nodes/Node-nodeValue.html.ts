import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Text.nodeValue', ({ document }) => {
		let the_text = document.createTextNode('A span!');
		expect(the_text.nodeValue).toBe('A span!');
		expect(the_text.data).toBe('A span!');
		the_text.nodeValue = 'test again';
		expect(the_text.nodeValue).toBe('test again');
		expect(the_text.data).toBe('test again');
		the_text.nodeValue = null;
		expect(the_text.nodeValue).toBe('');
		expect(the_text.data).toBe('');
	});
	context.test('Comment.nodeValue', ({ document }) => {
		let the_comment = document.createComment('A comment!');
		expect(the_comment.nodeValue).toBe('A comment!');
		expect(the_comment.data).toBe('A comment!');
		the_comment.nodeValue = 'test again';
		expect(the_comment.nodeValue).toBe('test again');
		expect(the_comment.data).toBe('test again');
		the_comment.nodeValue = null;
		expect(the_comment.nodeValue).toBe('');
		expect(the_comment.data).toBe('');
	});
	context.test('ProcessingInstruction.nodeValue', ({ document }) => {
		let the_pi = document.createProcessingInstruction('pi', 'A PI!');
		expect(the_pi.nodeValue).toBe('A PI!');
		expect(the_pi.data).toBe('A PI!');
		the_pi.nodeValue = 'test again';
		expect(the_pi.nodeValue).toBe('test again');
		expect(the_pi.data).toBe('test again');
		the_pi.nodeValue = null;
		expect(the_pi.nodeValue).toBe('');
		expect(the_pi.data).toBe('');
	});
}
