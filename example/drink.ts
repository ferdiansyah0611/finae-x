// deno-lint-ignore-file no-explicit-any
import { Program } from '../mod.ts';
import { OptionType, ProgramType } from '../types.d.ts';

const program: ProgramType.Type = new Program('Drink CLI', 'An application for drink ordering', {
	version: '1.0.0',
});

program
	.command('buy', 'Buy new drink')
	.option(
		'size',
		'select size',
		(cls: OptionType.Type) => cls.include(['small', 'medium', 'big']),
	)
	.option('free', 'free drink', (cls: OptionType.Type) => cls.implies({ size: 'small' }))
	.action((options: any) => {
		console.log('You ordered a drink with:');
		console.log('- %s size', options.size);
		if (options.free) console.log('- Free Price');
	});

await program.exec('buy --size big');
/*
Output:
You ordered a drink with:
- big size
*/
await program.exec('buy --free');
/*
Output:
You ordered a drink with:
- small size
- Free Price
*/
