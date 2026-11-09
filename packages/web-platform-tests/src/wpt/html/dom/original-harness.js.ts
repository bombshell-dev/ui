export function stringRep(val: unknown): string {
	if (val === null) {
		// typeof is object, so the switch isn't useful
		return 'null';
	}
	// In JavaScript, -0 === 0 and String(-0) == "0", so we have to
	// special-case.
	if (val === -0 && 1 / val === -Infinity) {
		return '-0';
	}
	switch (typeof val) {
		case 'string':
			for (var i = 0; i < 32; i++) {
				var replace = '\\';
				switch (i) {
					case 0:
						replace += '0';
						break;
					case 1:
						replace += 'x01';
						break;
					case 2:
						replace += 'x02';
						break;
					case 3:
						replace += 'x03';
						break;
					case 4:
						replace += 'x04';
						break;
					case 5:
						replace += 'x05';
						break;
					case 6:
						replace += 'x06';
						break;
					case 7:
						replace += 'x07';
						break;
					case 8:
						replace += 'b';
						break;
					case 9:
						replace += 't';
						break;
					case 10:
						replace += 'n';
						break;
					case 11:
						replace += 'v';
						break;
					case 12:
						replace += 'f';
						break;
					case 13:
						replace += 'r';
						break;
					case 14:
						replace += 'x0e';
						break;
					case 15:
						replace += 'x0f';
						break;
					case 16:
						replace += 'x10';
						break;
					case 17:
						replace += 'x11';
						break;
					case 18:
						replace += 'x12';
						break;
					case 19:
						replace += 'x13';
						break;
					case 20:
						replace += 'x14';
						break;
					case 21:
						replace += 'x15';
						break;
					case 22:
						replace += 'x16';
						break;
					case 23:
						replace += 'x17';
						break;
					case 24:
						replace += 'x18';
						break;
					case 25:
						replace += 'x19';
						break;
					case 26:
						replace += 'x1a';
						break;
					case 27:
						replace += 'x1b';
						break;
					case 28:
						replace += 'x1c';
						break;
					case 29:
						replace += 'x1d';
						break;
					case 30:
						replace += 'x1e';
						break;
					case 31:
						replace += 'x1f';
						break;
				}
				val = (val as string).replace(String.fromCharCode(i), replace);
			}
			return '"' + (val as string).replace('"', '\\"') + '"';
		case 'boolean':
		case 'undefined':
		case 'number':
			return String(val);
		default:
			return typeof val + ' "' + (val as string) + '"';
	}
}
