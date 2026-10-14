import type { KeyDown, KeyRepeat } from '@bomb.sh/tty';

export interface TextEditorOptions {
	multiline?: boolean;
	content?: string;
	onChange?: (editor: TextEditor) => void;
}

/** Persistent editing state, indexed by Unicode code point rather than UTF-16 unit. */
export class TextEditor {
	readonly multiline: boolean;
	private value: string;
	private position: number;
	private readonly onChange?: (editor: TextEditor) => void;

	constructor(options: TextEditorOptions = {}) {
		this.multiline = options.multiline ?? false;
		this.value = this.normalize(options.content ?? '');
		this.position = [...this.value].length;
		this.onChange = options.onChange;
	}

	get content(): string {
		return this.value;
	}
	set content(value: string) {
		const next = this.normalize(value);
		if (next === this.value) return;
		this.value = next;
		this.caret = this.position;
		this.onChange?.(this);
	}

	get caret(): number {
		return this.position;
	}
	set caret(value: number) {
		this.position = Math.max(0, Math.min([...this.value].length, Math.trunc(value) || 0));
	}

	insert(text: string): void {
		const inserted = [...this.normalize(text)];
		if (!inserted.length) return;
		const points = [...this.value];
		points.splice(this.position, 0, ...inserted);
		this.position += inserted.length;
		this.content = points.join('');
	}

	deleteBackward(): void {
		if (this.position === 0) return;
		const points = [...this.value];
		points.splice(--this.position, 1);
		this.content = points.join('');
	}

	deleteForward(): void {
		const points = [...this.value];
		if (this.position === points.length) return;
		points.splice(this.position, 1);
		this.content = points.join('');
	}

	moveBack(): void {
		this.caret--;
	}
	moveForward(): void {
		this.caret++;
	}
	moveMin(): void {
		this.caret = this.multiline ? [...this.value].slice(0, this.position).lastIndexOf('\n') + 1 : 0;
	}
	moveMax(): void {
		const points = [...this.value];
		const end = this.multiline ? points.indexOf('\n', this.position) : -1;
		this.caret = end < 0 ? points.length : end;
	}

	handleKey(event: KeyDown | KeyRepeat): boolean {
		if (event.code === 'Enter') {
			if (!this.multiline) return false;
			this.insert('\n');
		} else if (event.text) this.insert(event.text);
		else if (event.code === 'Backspace') this.deleteBackward();
		else if (event.code === 'Delete') this.deleteForward();
		else if (event.code === 'ArrowLeft') this.moveBack();
		else if (event.code === 'ArrowRight') this.moveForward();
		else if (event.code === 'Home') this.moveMin();
		else if (event.code === 'End') this.moveMax();
		else return false;
		return true;
	}

	private normalize(value: string): string {
		return this.multiline ? value.replace(/\r\n?/g, '\n') : value.replace(/[\r\n]/g, '');
	}
}
