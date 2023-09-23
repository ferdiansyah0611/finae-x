// deno-lint-ignore-file no-explicit-any
import { Program } from '@/mod.ts';

const program = new Program('MY CLI', 'description', {
	version: '1.0.0',
});

program
	.command('add', 'create new data')
	.argument('name', 'your name')
	.action((argument: any) => {
		console.log('ARGUMENT:');
		console.log(argument);
	});

try {
	await program.exec('add ferdiansyah');
	await program.exec('add --help');
} catch (error) {
	console.log(error.message);
}
