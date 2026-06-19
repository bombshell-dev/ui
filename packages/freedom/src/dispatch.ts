import type { Operation, Result } from 'effection';
import { createApi, type Api } from '@effectionx/context-api';
import type { Node } from './types.ts';
import { TreeContext } from './state.ts';

export interface Dispatch {
	dispatch(event: unknown): Operation<Result<true>>;
	getNodeById(id: string): Operation<Node | undefined>;
}

export const DispatchApi: Api<Dispatch> = createApi<Dispatch>('freedom:dispatch', {
	*dispatch(_event: unknown): Operation<Result<true>> {
		return { ok: false, error: new Error('unhandled') };
	},

	*getNodeById(id: string): Operation<Node | undefined> {
		let tree = yield* TreeContext.expect();
		return tree.nodes.get(id);
	},
});
