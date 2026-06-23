import type { BoxProps } from "@clack/ui";

import { h } from "preact";

export function Box(props: BoxProps) {
    return h('tui-box', props);
}
