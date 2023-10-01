// deno-lint-ignore-file
import { red } from '../package/colors.ts';
import highlight from './highlight.ts';

export default function stderr(value: any[] | any) {
	if (Array.isArray(value)) {
		console.log(red('Error:'));
		value.map((v) => console.log('  -', highlight(v)));
	} else {
		console.log(red('Error:'), highlight(value));
	}

	return { errors: value };
}
