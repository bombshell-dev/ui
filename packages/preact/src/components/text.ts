import type { TextProps } from "@clack/ui";

import { h } from "preact";

export function Text(props: TextProps) {
    return h('tui-text', props);
}
