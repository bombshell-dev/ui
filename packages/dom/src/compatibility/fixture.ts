import type { DOMFixture } from './context.ts';
import { MissingGlobalError, type DOMGlobalBindings, type DOMGlobals } from './globals.ts';
import type { DOMDocument } from './contracts/nodes.ts';
import {
	MissingInputError,
	testInput,
	type DOMInputDriver,
	type DOMTestInput,
} from './input-driver.ts';

export interface DOMFixtureOptions<D> {
	create(): D;
	globals: DOMGlobalBindings | ((document: D) => DOMGlobalBindings);
	/** Construct a fresh input session lazily, only when a case uses host input. */
	input?(document: D): DOMInputDriver;
	/** Dispose implementation-owned resources after each case, including failures. */
	dispose?(document: D): void | Promise<void>;
}

/** Compatibility FixtureFailure support. */
export class FixtureFailure extends AggregateError {
	constructor(errors: unknown[]) {
		super(errors, 'Compatibility case and fixture cleanup reported multiple failures');
		this.name = 'FixtureFailure';
	}
}

/** A case owns its document, bindings and cleanups, including during asynchronous work. */
export async function withFixture<D>(
	options: DOMFixtureOptions<D>,
	run: (fixture: DOMFixture) => void | Promise<void>,
): Promise<void> {
	const subject = options.create();
	const cleanups: (() => void | Promise<void>)[] = [];
	const failures: unknown[] = [];
	let driver: DOMInputDriver | undefined;
	let input: DOMTestInput | undefined;
	try {
		const bindings =
			typeof options.globals === 'function' ? options.globals(subject) : options.globals;
		// Test contracts describe the expected APIs; enabled cases verify their behavior.
		const document = subject as DOMDocument;
		const globals = bindings as DOMGlobals;
		await run({
			document,
			get input() {
				if (!input) {
					if (!options.input) throw new MissingInputError();
					driver = options.input(subject);
					input = testInput(driver);
				}
				return input;
			},
			globals(name) {
				if (!(name in globals)) throw new MissingGlobalError(name);
				return globals[name];
			},
			cleanup(callback) {
				cleanups.push(callback);
			},
			connect(element) {
				const parent = document.body ?? document.documentElement ?? document;
				parent.appendChild(element);
				cleanups.push(() => element.remove());
				return element;
			},
		});
	} catch (error) {
		failures.push(error);
	} finally {
		// Release input while the document and its targets are still alive.
		try {
			await driver?.reset();
		} catch (error) {
			failures.push(error);
		}
		// One failed cleanup must not retain listeners or prevent disposal of a browser frame.
		for (const cleanup of cleanups.toReversed()) {
			try {
				await cleanup();
			} catch (error) {
				failures.push(error);
			}
		}
		try {
			await options.dispose?.(subject);
		} catch (error) {
			failures.push(error);
		}
	}
	if (failures.length === 1) throw failures[0];
	if (failures.length > 1) throw new FixtureFailure(failures);
}
