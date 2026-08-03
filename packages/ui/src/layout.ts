import { type Op } from '@bomb.sh/tty';
import { Api } from './core/api.ts';

export class LayoutApi extends Api {
	*layout(): Iterable<Op> {}
}
