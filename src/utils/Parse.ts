// deno-lint-ignore-file

interface CommandLineArgs {
	_: string[];
	[key: string]: string | string[] | boolean;
}

export default function Parse(args: string[]): CommandLineArgs {
	const result: CommandLineArgs = { _: [] };

	let currentKey: string | null = null;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg.startsWith('--')) {
			const key = arg.slice(2);
			currentKey = key;
			result[key] = true;
		} else if (arg.startsWith('-')) {
			const key = arg.slice(1);
			currentKey = key;
			result[key] = true;
		} else if (currentKey) {
			if (Array.isArray(result[currentKey])) {
				// @ts-ignore
				result[currentKey].push(arg);
			} else if (result[currentKey]) {
				result[currentKey] = [arg];
			} else {
				result[currentKey] = arg;
			}
		} else {
			result._.push(arg);
		}
	}

	return result;
}
