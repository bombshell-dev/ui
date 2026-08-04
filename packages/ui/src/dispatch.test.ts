import { describe, expect, test } from 'vitest';
import { DispatchApi } from './dispatch.ts';
import { createHost } from './host.ts';

describe('dispatch', () => {
	test('propagates errors thrown by decorators installed on the host', () => {
		const host = createHost();
		const reason = new Error('dispatch failed');
		const dispatch = DispatchApi.init(host.root);
		DispatchApi.decorate(host.root, () => ({
			dispatch() {
				throw reason;
			},
		}));

		expect(() => dispatch.dispatch({})).toThrow(reason);
	});
});
