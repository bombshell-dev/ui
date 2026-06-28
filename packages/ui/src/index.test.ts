import { describe, expect, test } from 'vitest';
import * as ui from './index.ts';

describe('public exports', () => {
	test('exposes createRoot and RenderRoot as runtime values', () => {
		expect(typeof ui.createRoot).toBe('function');
		expect(typeof ui.RenderRoot).toBe('function');
	});

	test('exposes layout helpers', () => {
		expect(typeof ui.fixed).toBe('function');
		expect(typeof ui.grow).toBe('function');
	});
});
