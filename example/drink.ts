import { Program } from '@/mod.ts';

const program = new Program('Drink CLI', 'An application for drink ordering', {
	version: '1.0.0',
});

program
	.command('buy', 'Buy new drink')
	.option(
		'size',
		'select size',
		(cls) => cls.include(['small', 'medium', 'big']),
	)
	.option('free', 'free drink', (cls) => cls.implies({ size: 'small' }))
	.action((options) => {
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
