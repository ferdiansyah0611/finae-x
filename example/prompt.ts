// deno-lint-ignore-file no-explicit-any
import { Program } from '@/mod.ts';

const program = new Program('Prompt CLI', 'prompt example', {
	version: '1.0.0',
	suggestAfterError: true,
});
program
	.command('create', 'create new data')
	.argument('name', 'your name')
	.action((argument: any) => {
		console.log('ARGUMENT:');
		console.log(argument);
	});

program
	.command('update', 'update data')
	.argument('id', 'primary key')
	.option('name', 'new name')
	.action((argument: any) => {
		console.log('ARGUMENT:');
		console.log(argument);
	});


createPrompt();

function createPrompt() {
	async function main() {
		const value = prompt('>');
		if (value === 'exit') return;
		if (value) await program.exec(value);
		main();
	}
	main();
}