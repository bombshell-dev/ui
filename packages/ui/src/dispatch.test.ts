import { describe, expect, test } from 'vitest';
import { DispatchApi, useDispatch } from './dispatch.ts';
import { createHost } from './host.ts';

const { dispatch } = DispatchApi.methods;

describe('dispatch', () => {
	test('catches errors thrown by middleware installed on the host', () => {
		const host = createHost();
		const reason = new Error('dispatch failed');
		useDispatch(host);
		DispatchApi.around(host.root, {
			dispatch() {
				throw reason;
			},
		});

		expect(dispatch(host.root, {})).toEqual({ ok: false, reason });
	});
});
