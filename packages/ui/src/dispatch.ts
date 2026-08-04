import { Api } from './core/api.ts';

export class DispatchApi extends Api {
	dispatch(_event: unknown): Result {
		return { ok: true };
	}
}

export type Result =
	| typeof Ok
	| {
			ok: false;
			reason: unknown;
	  };

const Ok = { ok: true } as const;
