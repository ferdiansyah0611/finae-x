import { green } from '../package/colors.ts';

// deno-lint-ignore no-explicit-any
export default function highlight(value: string | any): string {
	if (typeof value !== 'string') return value;
	const quotes = [...value.matchAll(/('[^']+')/gi)];
	for (const quote of quotes) {
		value = value.replaceAll(quote[0], green(quote[0]));
	}
	return value;
}
