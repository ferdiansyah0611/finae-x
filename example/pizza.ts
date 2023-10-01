// deno-lint-ignore-file no-explicit-any
import { Program } from '../mod.ts';
import { ProgramType, OptionType } from '../types.d.ts';

const program: ProgramType.Type = new Program('Pizza CLI', 'An application for pizza ordering', {
	version: '1.0.0',
});

program
	.command('order', 'New Order')
	.option('-p, --peppers', 'Add peppers')
	.option('-c, --cheese <type>', 'Add the specified type of cheese', (cls: OptionType.Type) => cls.default('marble'))
	.option('-C, --no-cheese', 'You do not want any cheese')
	.action((options: any) => {
		console.log('You ordered a pizza with:');
		if (options.p || options.peppers) {
			console.log('- Peppers');
		}
		console.log('- %s Cheese', options.c || options.cheese);
	});

await program.exec('order -p --no-cheese');
/*
Output:
You ordered a pizza with:
- Peppers
- marble Cheese
*/
await program.exec('order -p --cheese blue');
/*
Output:
You ordered a pizza with:
- Peppers
- blue Cheese
*/
