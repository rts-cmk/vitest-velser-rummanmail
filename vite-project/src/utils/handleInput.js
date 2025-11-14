export function handleInput(input) {
	// Explicit null handling
	if (input === null) return null;

	// undefined is considered a programming error
	if (input === undefined) throw new TypeError('Input is undefined');

	// Numbers: only accept finite numbers and double them
	if (typeof input === 'number') {
		if (!Number.isFinite(input)) throw new TypeError('Number must be finite');
		return input * 2;
	}

	// Strings: trim and uppercase
	if (typeof input === 'string') {
		return input.trim().toUpperCase();
	}

	// Anything else is invalid
	throw new Error('Invalid input: unsupported type');
}

export default handleInput;

