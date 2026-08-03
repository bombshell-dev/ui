import { createApi } from '@bomb.sh/tree';

export const RenderApi = createApi('render', {
	requestRender(_): void {},
});

export const { requestRender } = RenderApi.methods;
