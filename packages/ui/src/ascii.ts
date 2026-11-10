export function asciiLowercase(s: string): string {
	return s.replace(/[A-Z]/g, (c) => c.toLowerCase());
}

export function asciiUppercase(s: string): string {
	return s.replace(/[a-z]/g, (c) => c.toUpperCase());
}
