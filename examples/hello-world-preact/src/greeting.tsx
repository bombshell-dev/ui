import { useEffect, useState } from 'preact/hooks';
import { greetingFrames } from './animation.ts';

export function Greeting() {
	const [text, setText] = useState('Hello World!');

	useEffect(() => {
		const animation = greetingFrames();
		let timer: ReturnType<typeof setTimeout>;

		function advance() {
			const frame = animation.next().value;
			setText(frame.text);
			timer = setTimeout(advance, frame.delay);
		}

		advance();
		return () => clearTimeout(timer);
	}, []);

	return <span>{text}</span>;
}
