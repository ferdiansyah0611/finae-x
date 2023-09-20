import { posix } from 'https://deno.land/std@0.201.0/path/mod.ts';

const __filename = posix.fromFileUrl(import.meta.url);
const __dirname = posix.dirname(__filename).replace('\\src', '');

export const paths = {
	root: (...path: string[]) => posix.join(__dirname, ...path),
};
