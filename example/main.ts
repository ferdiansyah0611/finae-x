// deno-lint-ignore-file no-explicit-any
import { Program } from '../mod.ts';
import { HelpType, ProgramType } from '../types.d.ts';

const program: ProgramType.Type = new Program('MY CLI', 'description', {
	version: '1.0.0',
});

program
	.command('add', 'create new data')
	.argument('name', 'a'.repeat(200))
	.argument('id', 'a'.repeat(250))
	.action((argument: any) => {
		console.log('ARGUMENT:');
		console.log(argument);
	});

try {
	await program.exec(Deno.args);
} catch (error) {
	console.log(error.message);
}
