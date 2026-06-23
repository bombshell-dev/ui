import type { TextProps } from "@clack/ui";
import type { FunctionComponent } from "preact";

import { h } from "preact";

export const Text: FunctionComponent<TextProps> = (props) => h('tui-text', props);
