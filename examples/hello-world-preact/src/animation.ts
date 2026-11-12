export interface GreetingFrame {
	text: string;
	delay: number;
}

const prefix = 'Hello ';
const greetings = ['World!', 'DOM!', 'Preact!', 'Clack!'];
const pause = 900;
const erase = 60;
const type = 100;

/** Each frame says what to show and how long to leave it on screen. */
export function* greetingFrames(): Generator<GreetingFrame, never, void> {
	let index = 0;
	const suffix = [...greetings[index]!];
	yield { text: prefix + suffix.join(''), delay: pause };

	while (true) {
		while (suffix.length > 0) {
			suffix.pop();
			yield { text: prefix + suffix.join(''), delay: erase };
		}

		index = (index + 1) % greetings.length;
		const next = [...greetings[index]!];
		for (const character of next) {
			suffix.push(character);
			yield {
				text: prefix + suffix.join(''),
				delay: suffix.length === next.length ? pause : type,
			};
		}
	}
}
