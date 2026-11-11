import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		const modifiers = [
			{ init: 'ctrlKey', key: 'Control' },
			{ init: 'shiftKey', key: 'Shift' },
			{ init: 'altKey', key: 'Alt' },
			{ init: 'metaKey', key: 'Meta' },
			{ init: 'modifierAltGraph', key: 'AltGraph' },
			{ init: 'modifierCapsLock', key: 'CapsLock' },
		];
		const unsettableKeys = [
			'Fn',
			'FnLock',
			'Hyper',
			'NumLock',
			'ScrollLock',
			'Super',
			'Symbol',
			'SymbolLock',
		];
		const allKeys = modifiers.map((modifier) => modifier.key).concat(unsettableKeys);
		{
			const ctor = { name: 'KeyboardEvent' };
			context.test(
				`${ctor.name}.getModifierState() returns false for every modifier when none are set`,
				({ KeyboardEvent: Constructor }) => {
					const ctor = {
						name: 'KeyboardEvent',
						construct: (init: KeyboardEventInit) => new Constructor('keydown', init),
					};

					const event = ctor.construct({});
					for (const key of allKeys) expect(event.getModifierState(key), key).toBe(false);
				},
			);
			for (const modifier of modifiers) {
				context.test(
					`${ctor.name}.getModifierState('${modifier.key}') reflects ${modifier.init} in isolation`,
					({ KeyboardEvent: Constructor }) => {
						const ctor = {
							name: 'KeyboardEvent',
							construct: (init: KeyboardEventInit) => new Constructor('keydown', init),
						};

						const event = ctor.construct({ [modifier.init]: true });
						expect(event.getModifierState(modifier.key), `${modifier.key} should be active`).toBe(
							true,
						);
						for (const key of allKeys) {
							if (key !== modifier.key)
								expect(event.getModifierState(key), `${key} should be inactive`).toBe(false);
						}
					},
				);
			}
			context.test(
				`${ctor.name}.getModifierState() reports every modifier when all are set`,
				({ KeyboardEvent: Constructor }) => {
					const ctor = {
						name: 'KeyboardEvent',
						construct: (init: KeyboardEventInit) => new Constructor('keydown', init),
					};

					const init: Record<string, boolean> = {};
					for (const modifier of modifiers) init[modifier.init] = true;
					const event = ctor.construct(init);
					for (const modifier of modifiers)
						expect(event.getModifierState(modifier.key), `${modifier.key} should be active`).toBe(
							true,
						);
					for (const key of unsettableKeys)
						expect(event.getModifierState(key), `${key} should be inactive`).toBe(false);
				},
			);
		}
	}
	{
		const { expect } = context.runner;
		const modifiers = [
			{ init: 'ctrlKey', key: 'Control' },
			{ init: 'shiftKey', key: 'Shift' },
			{ init: 'altKey', key: 'Alt' },
			{ init: 'metaKey', key: 'Meta' },
			{ init: 'modifierAltGraph', key: 'AltGraph' },
			{ init: 'modifierCapsLock', key: 'CapsLock' },
		];
		const unsettableKeys = [
			'Fn',
			'FnLock',
			'Hyper',
			'NumLock',
			'ScrollLock',
			'Super',
			'Symbol',
			'SymbolLock',
		];
		const allKeys = modifiers.map((modifier) => modifier.key).concat(unsettableKeys);
		{
			const ctor = { name: 'MouseEvent' };
			context.test(
				`${ctor.name}.getModifierState() returns false for every modifier when none are set`,
				({ MouseEvent: Constructor }) => {
					const ctor = {
						name: 'MouseEvent',
						construct: (init: MouseEventInit) => new Constructor('mousedown', init),
					};

					const event = ctor.construct({});
					for (const key of allKeys) expect(event.getModifierState(key), key).toBe(false);
				},
			);
			for (const modifier of modifiers) {
				context.test(
					`${ctor.name}.getModifierState('${modifier.key}') reflects ${modifier.init} in isolation`,
					({ MouseEvent: Constructor }) => {
						const ctor = {
							name: 'MouseEvent',
							construct: (init: MouseEventInit) => new Constructor('mousedown', init),
						};

						const event = ctor.construct({ [modifier.init]: true });
						expect(event.getModifierState(modifier.key), `${modifier.key} should be active`).toBe(
							true,
						);
						for (const key of allKeys) {
							if (key !== modifier.key)
								expect(event.getModifierState(key), `${key} should be inactive`).toBe(false);
						}
					},
				);
			}
			context.test(
				`${ctor.name}.getModifierState() reports every modifier when all are set`,
				({ MouseEvent: Constructor }) => {
					const ctor = {
						name: 'MouseEvent',
						construct: (init: MouseEventInit) => new Constructor('mousedown', init),
					};

					const init: Record<string, boolean> = {};
					for (const modifier of modifiers) init[modifier.init] = true;
					const event = ctor.construct(init);
					for (const modifier of modifiers)
						expect(event.getModifierState(modifier.key), `${modifier.key} should be active`).toBe(
							true,
						);
					for (const key of unsettableKeys)
						expect(event.getModifierState(key), `${key} should be inactive`).toBe(false);
				},
			);
		}
	}
}
