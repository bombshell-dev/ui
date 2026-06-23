import type { BoxProps } from "@clack/ui";
import type { FunctionComponent } from "preact";

import { h } from "preact";

export const Box: FunctionComponent<BoxProps> = (props) => h('tui-box', props);
