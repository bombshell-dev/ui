// WPT helper: html/semantics/forms/the-option-element/option-label-value.js
import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const member of ['value'] as const) {
		context.test('No children, no ' + member, ({ document }) => {
			let option = document.createElement('option');
			expect(option[member]).toBe('');
		});
		context.test('No children, empty ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.setAttribute(member, '');
			expect(option[member]).toBe('');
		});
		context.test('No children, ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.setAttribute(member, member);
			expect(option[member]).toBe(member);
		});
		context.test('No children, namespaced ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.setAttributeNS('http://www.example.com/', member, member);
			expect(option[member]).toBe('');
		});
		context.test('Single child, no ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.appendChild(document.createTextNode(' child '));
			expect(option[member]).toBe('child');
		});
		context.test('Single child, empty ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.appendChild(document.createTextNode(' child '));
			option.setAttribute(member, '');
			expect(option[member]).toBe('');
		});
		context.test('Single child, ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.appendChild(document.createTextNode(' child '));
			option.setAttribute(member, member);
			expect(option[member]).toBe(member);
		});
		context.test('Single child, namespaced ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.appendChild(document.createTextNode(' child '));
			option.setAttributeNS('http://www.example.com/', member, member);
			expect(option[member]).toBe('child');
		});
		context.test('Two children, no ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.appendChild(document.createTextNode(' child '));
			option.appendChild(document.createTextNode(' node '));
			expect(option[member]).toBe('child node');
		});
		context.test('Two children, empty ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.appendChild(document.createTextNode(' child '));
			option.appendChild(document.createTextNode(' node '));
			option.setAttribute(member, '');
			expect(option[member]).toBe('');
		});
		context.test('Two children, ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.appendChild(document.createTextNode(' child '));
			option.appendChild(document.createTextNode(' node '));
			option.setAttribute(member, member);
			expect(option[member]).toBe(member);
		});
		context.test('Two children, namespaced ' + member, ({ document }) => {
			let option = document.createElement('option');
			option.appendChild(document.createTextNode(' child '));
			option.appendChild(document.createTextNode(' node '));
			option.setAttributeNS('http://www.example.com/', member, member);
			expect(option[member]).toBe('child node');
		});
	}
}
