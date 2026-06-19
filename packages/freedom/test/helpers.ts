// node.eval() executes the Operation inside the node's Effection scope so focus/freedom
// API operations work. Without toEval, every assert-after-eval needs explicit
// Result unwrapping and extra setup to establish the effection scope.

import { expect as vitestExpect } from 'vitest';
import { type Operation, sleep } from 'effection';
import type { Node } from '../src/index.ts';

export function expect(value: Node): ReturnType<typeof vitestExpect> & {
	toEval(fn: () => Operation<void>): Operation<void>;
};
export function expect<T>(value: T): ReturnType<typeof vitestExpect>;
export function expect(value: unknown):
	| ReturnType<typeof vitestExpect>
	| (ReturnType<typeof vitestExpect> & {
			toEval(fn: () => Operation<void>): Operation<void>;
	  }) {
	let base = vitestExpect(value);
	if (value && typeof value === 'object' && 'eval' in value) {
		let node = value as Node;
		return new Proxy(base, {
			get(target, prop, receiver) {
				if (prop === 'toEval') {
					return (fn: () => Operation<void>): Operation<void> => ({
						*[Symbol.iterator]() {
							// let pending child component tasks settle
							yield* sleep(0);
							let r = yield* node.eval(fn);
							if (!r.ok) {
								throw r.error;
							}
						},
					});
				}
				return Reflect.get(target, prop, receiver);
			},
		});
	}
	return base;
}
