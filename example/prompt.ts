// deno-lint-ignore-file no-explicit-any
import { Program } from '../mod.ts';
import { ProgramType } from '../types.d.ts';

const program: ProgramType.Type = new Program('Prompt CLI', 'prompt example', {
	version: '1.0.0',
	suggestAfterError: true,
});
program
	.command('create', 'create new data')
	.argument('name', 'your name')
	.action((argument: any) => {
		console.log('Name : %s', argument.name);
	});

program
	.command('update', 'update data')
	.argument('id', 'primary key')
	.option('name', 'new name')
	.action((argument: any, option: any) => {
		console.log('Name\t : %s', option.name);
		console.log('ID\t : %s', argument.id);
	});

async function main(value: string): Promise<any> {
	await program.exec(value);
	return prompter();
}
function prompter() {
	const value = prompt('>');
	if (!value) return prompter();
	if (value === 'exit') return;
	return main(value);
}

prompter();
