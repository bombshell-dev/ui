// Author: Eric Willigers <ericwilligers@chromium.org>.
// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_invalid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const value of [
		'grid inline-grid',
		'none grid',
		'none flow',
		'none ruby',
		'none flow-root',
		'none list-item',
		'contents list-item',
		'list-item contents',
		'flow flow',
		'block block',
		'flow flow-root',
		'flow-root flow-root',
		'block inline',
		'flex ruby',
		'ruby flex',
		'inline inline',
		'flex flex',
		'grid flex',
		'ruby grid',
		'flex grid',
		'grid table',
		'table flex',
		'flex table',
		'ruby table',
		'table table',
		'table flow-root',
		'flow-root ruby',
		'list-item list-item',
		'list-item table',
		'flex list-item',
		'list-item grid',
		'flow flow list-item',
		'grid flow list-item',
		'flow list-item flow',
		'block list-item block',
		'list-item flow-root flow',
		'list-item block block',
		'list-item block list-item',
		'list-item flow-root list-item',
		'list-item flow-root block list-item',
		'list-item block flow-root list-item',
		'block list-item flow-root list-item',
		'flow-root list-item block list-item',
		'list-item ruby',
		'ruby list-item',
		'ruby ruby',
		'ruby flow',
		'flow ruby',
		'ruby flow-root',
		'grid ruby',
		'table ruby',
		'table-row flow',
		'flow table-row',
		'table-row-group flow-root',
		'flex table-row-group',
	]) {
		context.test(
			`e.style['display'] = ${JSON.stringify(value)} should not set the property value`,
			({ document }) => {
				test_invalid_value({ document, expect }, 'display', value);
			},
		);
	}
}
